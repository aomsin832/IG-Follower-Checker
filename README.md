# Instagram Friendship Tracker  

This script fetches and analyzes friendship data (followers and following) from Instagram using its API. It identifies users who:  
- You don't follow back.  
- Don't follow you back.  

### Prerequisites  
- **Instagram Account**: The script requires you to log into Instagram.  
- **Browser Console Access**: The script runs in the browser's developer console.  
- **Supported Browser**: Use the latest version of Chrome or Firefox for compatibility.  

### Features  
1. **Automated API Calls**: Recursively fetches all followers and following lists using Instagram's API.  
2. **Rate-Limiting Compliance**: Includes random delays to avoid hitting Instagram's rate limits.  
3. **Insightful Analysis**: Outputs lists of:  
   - People who don't follow you back.  
   - People you don't follow back.  

### How to Use  
1. Log in to [Instagram](https://www.instagram.com) in your browser.  
2. Open the browser's **Developer Tools** (usually by pressing `F12` or `Ctrl+Shift+I`).  
3. Navigate to the **Console** tab.  
4. Copy and paste the script into the console.  
5. Replace the placeholder username (`"example_username"`) with your Instagram username:  
   ```javascript
   username = "your_instagram_username";
