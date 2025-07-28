# Instagram Quick Fix

## The Problem
Your Instagram and Facebook Client IDs are different:
- Instagram: `682487447915438`
- Facebook: `1896889553828321`

This causes the "Invalid platform app" error.

## Quick Solution

### Option 1: Use Facebook App for Instagram (Recommended)

Update your `.env` file:

```bash
# Change this line:
INSTAGRAM_CLIENT_ID="682487447915438"
# To this:
INSTAGRAM_CLIENT_ID="1896889553828321"

# And change this line:
INSTAGRAM_APP_SECRET="068abe6d09b328de81db49c0637249ed"
# To this:
INSTAGRAM_APP_SECRET="50d843bd717c150eaf4a6b1d55389cec"
```

### Option 2: Verify Instagram App Configuration

1. Go to https://developers.facebook.com/apps/682487447915438/
2. Make sure "Instagram Basic Display" product is added
3. Verify the redirect URI is exactly: `https://der.ngopslah.web.id/api/instagram/callback`

## Test After Changes

1. Restart your application
2. Try connecting Instagram again
3. If still failing, run the debug script:
   ```bash
   npx ts-node scripts/debug-instagram.ts
   ```

## Expected OAuth URL

After fixing, your Instagram OAuth URL should look like:
```
https://api.instagram.com/oauth/authorize?client_id=1896889553828321&redirect_uri=https%3A%2F%2Fder.ngopslah.web.id%2Fapi%2Finstagram%2Fcallback&scope=user_profile,user_media&response_type=code&state=...
```

Try accessing this URL manually to test if it works.