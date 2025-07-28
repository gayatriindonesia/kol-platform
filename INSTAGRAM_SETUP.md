# Instagram API Integration Setup

## Prerequisites

You need to create a Facebook App with Instagram Basic Display product to enable Instagram integration.

## Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **Create App**
3. Choose **Consumer** as app type
4. Fill in app details:
   - App Name: Your app name
   - App Contact Email: Your email
   - Purpose: Choose appropriate option

## Step 2: Add Instagram Basic Display

1. In your Facebook App dashboard, click **Add Product**
2. Find **Instagram Basic Display** and click **Set Up**
3. This will add Instagram Basic Display to your app

## Step 3: Configure Instagram Basic Display

1. Go to **Instagram Basic Display** > **Basic Display**
2. Create a new Instagram App:
   - Display Name: Your app display name
   - Valid OAuth Redirect URIs: `http://localhost:3000/api/instagram/callback`
   - For production: `https://yourdomain.com/api/instagram/callback`
3. Save changes

## Step 4: Get App Credentials

1. In **Instagram Basic Display** > **Basic Display**
2. Copy the **Instagram App ID**
3. Copy the **Instagram App Secret**

## Step 5: Configure Environment Variables

Create `.env.local` file in your project root:

```bash
# Instagram API Configuration
INSTAGRAM_CLIENT_ID="your-instagram-app-id"
INSTAGRAM_APP_SECRET="your-instagram-app-secret" 
INSTAGRAM_REDIRECT_URI="http://localhost:3000/api/instagram/callback"
```

## Step 6: Test User Setup (Development)

For development, you need to add test users:

1. Go to **Instagram Basic Display** > **Roles** > **Roles**
2. Add Instagram Testers
3. The Instagram account owner needs to accept the invitation

## Step 7: Database Setup

Run the database seed to create platform records:

```bash
npm run prisma:seed
```

This will create the Instagram platform record in your database.

## Step 8: Test Integration

1. Start your development server: `npm run dev`
2. Log in to your application
3. Go to KOL Platform page
4. Click "Connect Instagram"
5. You should be redirected to Instagram OAuth flow

## Production Setup

For production deployment:

1. Update `INSTAGRAM_REDIRECT_URI` to your production domain
2. Add production redirect URI in Facebook App settings
3. Submit your app for App Review if needed (for public use)

## Scopes Used

The integration uses these Instagram scopes:
- `user_profile`: Access to user's profile information
- `user_media`: Access to user's media (photos and videos)

## API Endpoints Used

- **Authorization**: `https://api.instagram.com/oauth/authorize`
- **Token Exchange**: `https://api.instagram.com/oauth/access_token`
- **Profile Data**: `https://graph.instagram.com/me`
- **Media Data**: `https://graph.instagram.com/me/media`

## Troubleshooting

### Common Issues:

1. **"Instagram platform not found in database"**
   - Run `npm run prisma:seed` to create platform records

2. **"Invalid OAuth state"**
   - Clear browser cache and try again
   - Check if state parameter is being passed correctly

3. **"Access token expired"**
   - Instagram access tokens expire, users need to reconnect
   - Implement token refresh mechanism if needed

4. **"Invalid redirect URI"**
   - Ensure redirect URI in Facebook App matches INSTAGRAM_REDIRECT_URI
   - Include protocol (http/https) and exact path

5. **Environment variables not configured**
   - Ensure all required environment variables are set
   - Restart development server after adding variables

### Debug Mode

Enable debug logging by checking the console output. The integration includes detailed logging for troubleshooting.

## Security Notes

- Never expose App Secret in client-side code
- Use HTTPS in production
- Implement proper error handling
- Store access tokens securely
- Consider token encryption for sensitive data