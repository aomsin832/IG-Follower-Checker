# Instagram Follow Checker

A browser-console script for your own Instagram account. It compares your following and follower lists, shows accounts that do not follow you back, removes duplicate API rows, and separates saved famous accounts from ordinary results.

## What it does

- Reads your signed-in account ID from the current browser session — no username lookup route required.
- Loads followers and following with a short delay between paginated requests.
- Deduplicates accounts by username before comparing lists.
- Displays accounts you follow that do not follow you back, saved famous accounts that do not follow you back, and people who follow you but whom you do not follow back.
- Stores your famous-account list locally in the browser's Instagram site storage.

The script is read-only: it does **not** follow, unfollow, message, or modify your Instagram account.

## Run it

1. Log in at [instagram.com](https://www.instagram.com).
2. Open browser Developer Tools → **Console**.
3. Copy the contents of [`IG-Foll.js`](./IG-Foll.js), paste, and run it.
4. Keep the tab open until the results table appears.

If Instagram has rate-limited the session, wait a while and run it again.

## Famous-account list

After the script has run, use these Console commands:

```js
igFamous.add("leomessi", "nike", "ubc");
igFamous.list();
igFamous.remove("nike");
```

The usernames persist in that browser. On the next scan, they appear in their own **Saved famous accounts not following you back** table.

## Results

The latest scan is also available as `window.igResults`.

It contains three username arrays:

- `peopleIDontFollowBack`
- `regularNotFollowingBack`
- `famousNotFollowingBack`

## Notes

Instagram's internal endpoints can change or rate-limit requests without notice. This script uses your active browser session only; do not paste account cookies, passwords, or session tokens into third-party sites.
