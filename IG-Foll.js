(() => {
  if (window.location.origin !== "https://www.instagram.com") {
    window.alert("Open instagram.com, log in, then run this script again.");
    window.location.href = "https://www.instagram.com";
    return;
  }

  const FAMOUS_STORAGE_KEY = "ig-follow-checker:famous-accounts";

  const getCookie = (name) =>
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(\`\${name}=\`))
      ?.split("=")
      .slice(1)
      .join("=");

  const getFamousAccounts = () =>
    new Set(
      JSON.parse(localStorage.getItem(FAMOUS_STORAGE_KEY) || "[]").map((name) =>
        name.toLowerCase(),
      ),
    );

  const saveFamousAccounts = (accounts) =>
    localStorage.setItem(
      FAMOUS_STORAGE_KEY,
      JSON.stringify([...accounts].map((name) => name.toLowerCase()).sort()),
    );

  // These commands remain available after a scan:
  // igFamous.add("leomessi", "nike");
  // igFamous.remove("nike");
  // igFamous.list();
  window.igFamous = {
    list: () => [...getFamousAccounts()],
    add: (...accounts) => {
      const saved = getFamousAccounts();
      accounts.forEach((account) =>
        saved.add(account.replace(/^@/, "").toLowerCase()),
      );
      saveFamousAccounts(saved);
      console.log("Saved famous accounts:", [...saved]);
    },
    remove: (...accounts) => {
      const saved = getFamousAccounts();
      accounts.forEach((account) =>
        saved.delete(account.replace(/^@/, "").toLowerCase()),
      );
      saveFamousAccounts(saved);
      console.log("Saved famous accounts:", [...saved]);
    },
  };

  const headers = {
    "X-IG-App-ID": "936619743392459",
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json, text/plain, */*",
  };

  const sleep = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

  const fetchJson = async (url, label) => {
    const response = await fetch(url, {
      credentials: "include",
      headers,
      method: "GET",
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(\`\${label} failed (\${response.status}): \${text.slice(0, 120)}\`);
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(\`\${label} returned a webpage instead of JSON.\`);
    }
  };

  const uniqueAccounts = (accounts) => {
    const seen = new Map();

    accounts.forEach((account) => {
      const username = account?.username?.toLowerCase();
      if (username && !seen.has(username)) {
        seen.set(username, account);
      }
    });

    return [...seen.values()];
  };

  const getMyUserId = async () => {
    const cookieId = getCookie("ds_user_id");

    if (cookieId && /^\d+$/.test(cookieId)) {
      return cookieId;
    }

    const data = await fetchJson(
      "/api/v1/accounts/current_user/?edit=true",
      "Checking Instagram login",
    );

    const userId = data?.user?.pk ?? data?.user?.id;

    if (!userId) {
      throw new Error(
        "Could not identify your signed-in account. Refresh Instagram, confirm you are logged in, and try again.",
      );
    }

    return String(userId);
  };

  const getAllAccounts = async (type, userId, cursor = "") => {
    const url = new URL(
      \`/api/v1/friendships/\${userId}/\${type}/\`,
      window.location.origin,
    );

    url.searchParams.set("count", "50");

    if (cursor) {
      url.searchParams.set("max_id", cursor);
    }

    const data = await fetchJson(url, \`Loading \${type}\`);

    if (!Array.isArray(data.users)) {
      throw new Error(\`Instagram did not return a valid \${type} list.\`);
    }

    console.log(\`Loaded \${data.users.length} \${type}...\`);

    if (!data.next_max_id) {
      return data.users;
    }

    await sleep(1100);
    return data.users.concat(
      await getAllAccounts(type, userId, data.next_max_id),
    );
  };

  const scan = async () => {
    try {
      console.log("Finding your Instagram account...");
      const userId = await getMyUserId();

      console.log("Loading followers and following. Keep this tab open...");
      const [rawFollowers, rawFollowing] = await Promise.all([
        getAllAccounts("followers", userId),
        getAllAccounts("following", userId),
      ]);

      const followers = uniqueAccounts(rawFollowers);
      const following = uniqueAccounts(rawFollowing);

      const followerUsernames = new Set(
        followers.map((account) => account.username.toLowerCase()),
      );

      const followingUsernames = new Set(
        following.map((account) => account.username.toLowerCase()),
      );

      const notFollowingBack = following
        .filter(
          (account) => !followerUsernames.has(account.username.toLowerCase()),
        )
        .sort((a, b) => a.username.localeCompare(b.username));

      const peopleIDontFollowBack = followers
        .filter(
          (account) => !followingUsernames.has(account.username.toLowerCase()),
        )
        .map((account) => account.username)
        .sort((a, b) => a.localeCompare(b));

      const famousAccounts = getFamousAccounts();

      const famousNotFollowingBack = notFollowingBack.filter((account) =>
        famousAccounts.has(account.username.toLowerCase()),
      );

      const regularNotFollowingBack = notFollowingBack.filter(
        (account) => !famousAccounts.has(account.username.toLowerCase()),
      );

      window.igResults = {
        peopleIDontFollowBack,
        regularNotFollowingBack: regularNotFollowingBack.map(
          (account) => account.username,
        ),
        famousNotFollowingBack: famousNotFollowingBack.map(
          (account) => account.username,
        ),
      };

      console.log("──────── RESULTS ────────");
      console.log(\`Followers: \${followers.length}\`);
      console.log(\`Following: \${following.length}\`);
      console.log(
        \`Regular accounts not following back: \${regularNotFollowingBack.length}\`,
      );
      console.log(
        \`Famous accounts not following back: \${famousNotFollowingBack.length}\`,
      );

      console.log("Regular accounts not following you back:");
      console.table(
        regularNotFollowingBack.map((account) => ({
          username: account.username,
          name: account.full_name,
          verified: account.is_verified,
        })),
      );

      if (famousNotFollowingBack.length) {
        console.log("Saved famous accounts not following you back:");
        console.table(
          famousNotFollowingBack.map((account) => ({
            username: account.username,
            name: account.full_name,
            verified: account.is_verified,
          })),
        );
      }

      console.log("Copyable result object: window.igResults");
    } catch (error) {
      console.error("IG checker error:", error.message);
    }
  };

  scan();
})();