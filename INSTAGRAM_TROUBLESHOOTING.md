# Instagram "Invalid Platform App" Error - Troubleshooting Guide

## Current Error
```
Invalid Request: Request parameters are invalid: Invalid platform app
```

## Root Cause Analysis

The error occurs when Instagram's OAuth system cannot validate your app configuration. Common causes:

1. **App ID Mismatch**: Instagram Client ID doesn't match the Facebook App
2. **Missing Instagram Basic Display**: Product not added to Facebook App  
3. **Invalid Redirect URI**: Callback URL not whitelisted
4. **App Review Status**: App not properly configured for public use

## Step-by-Step Fix

### 1. Verify Facebook App Setup

Go to [Facebook Developers Console](https://developers.facebook.com/apps/)

**Check Your App ID:**
- Current Instagram Client ID: `682487447915438`
- Current Facebook Client ID: `1896889553828321`
- ❌ **These IDs are different - this is likely the problem!**

### 2. Fix App Configuration

**Option A: Use Same App for Both (Recommended)**
1. Go to your Facebook App (`1896889553828321`)
2. Add "Instagram Basic Display" product
3. Update your `.env` file:
   ```bash
   # Use the same app ID for both
   INSTAGRAM_CLIENT_ID="1896889553828321"
   FACEBOOK_CLIENT_ID="1896889553828321"
   ```

**Option B: Verify Separate Instagram App**
1. Go to Instagram App (`682487447915438`)
2. Ensure it has "Instagram Basic Display" product added
3. Verify the app secret matches your `.env`

### 3. Configure Instagram Basic Display

In your Facebook App dashboard:

1. **Add Product** → **Instagram Basic Display**
2. **Create Instagram App**:
   - Display Name: "Gayatri Platform"
   - Valid OAuth Redirect URIs: `https://der.ngopslah.web.id/api/instagram/callback`
   - Deauthorize Callback URL: `https://der.ngopslah.web.id/api/instagram/deauth`
   - Data Deletion Request URL: `https://der.ngopslah.web.id/api/instagram/delete`

3. **Instagram App Settings**:
   - Copy the Instagram App ID
   - Copy the Instagram App Secret
   - Update your `.env` file

### 4. Update Environment Variables

Based on your current setup, update `.env`:

```bash
# Instagram API (should match your Facebook App)
INSTAGRAM_CLIENT_ID="1896889553828321"  # Same as Facebook
INSTAGRAM_APP_SECRET="50d843bd717c150eaf4a6b1d55389cec"  # Same as Facebook
INSTAGRAM_REDIRECT_URI="https://der.ngopslah.web.id/api/instagram/callback"
INSTAGRAM_WEBHOOK_VERIFY_TOKEN="meatyhamhock"
INSTAGRAM_WEBHOOK_URL="https://der.ngopslah.web.id/api/webhooks/instagram"

# Facebook API
FACEBOOK_CLIENT_ID="1896889553828321"
FACEBOOK_APP_SECRET="50d843bd717c150eaf4a6b1d55389cec"
FACEBOOK_REDIRECT_URI="https://der.ngopslah.web.id/api/facebook/callback"
```

### 5. Test User Setup (Development)

If testing in development mode:

1. Go to **App Settings** → **Roles** → **Roles**
2. Add **Instagram Testers**
3. Add the Instagram account you want to test with
4. The Instagram account owner must accept the tester invitation

### 6. App Review (Production)

For production use:
1. Submit your app for App Review
2. Request permissions for:
   - `instagram_basic`
   - `pages_show_list` (if using business features)

### 7. Verify Configuration

Test your setup:

```bash
# Test URL (replace with your actual client_id)
https://api.instagram.com/oauth/authorize?
  client_id=1896889553828321&
  redirect_uri=https://der.ngopslah.web.id/api/instagram/callback&
  scope=user_profile,user_media&
  response_type=code&
  state=test
```

## Common Solutions

### Solution 1: App ID Consistency
```bash
# Make sure both use the same Facebook App ID
INSTAGRAM_CLIENT_ID="1896889553828321"
FACEBOOK_CLIENT_ID="1896889553828321"
```

### Solution 2: Recreate Instagram App
1. Delete current Instagram Basic Display app
2. Create new one with correct settings
3. Update environment variables

### Solution 3: Check Redirect URI Exact Match
```bash
# Must match exactly (including https, no trailing slash)
INSTAGRAM_REDIRECT_URI="https://der.ngopslah.web.id/api/instagram/callback"
```

## Verification Checklist

- [ ] Same App ID for Instagram and Facebook
- [ ] Instagram Basic Display product added
- [ ] Redirect URI exactly matches Facebook App settings
- [ ] App secret is correct
- [ ] Test user added (for development)
- [ ] App is in Development or Live mode as needed

## Debug Commands

Test your OAuth URL:
```javascript
const testUrl = `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.INSTAGRAM_REDIRECT_URI)}&scope=user_profile,user_media&response_type=code&state=debug`;
console.log('Test this URL:', testUrl);
```

Check app configuration:
```bash
curl "https://graph.facebook.com/v18.0/app?access_token=YOUR_APP_ACCESS_TOKEN"
```

After making these changes, restart your application and test the Instagram connection again.