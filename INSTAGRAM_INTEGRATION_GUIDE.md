# Instagram API Integration Guide

## Overview

This guide covers the enhanced Instagram API integration that includes:
- OAuth 2.0 authentication flow
- Advanced data syncing with detailed analytics
- Real-time webhook support
- Business account insights
- Comprehensive engagement metrics

## Features

### 🔐 Authentication
- Secure OAuth 2.0 flow with PKCE
- Automatic token management
- State validation for security

### 📊 Analytics
- Engagement rate calculations
- Post performance metrics
- Content type distribution
- Posting frequency analysis
- Top performing content identification

### 🔄 Real-time Updates
- Instagram webhook integration
- Automatic data synchronization
- Signature verification for security

### 📈 Business Insights
- Instagram Business API integration
- Account insights (impressions, reach, profile views)
- Media insights (likes, comments, saves, shares)
- Hashtag performance tracking

## Setup Instructions

### 1. Facebook App Configuration

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing app
3. Add Instagram Basic Display product
4. Configure OAuth redirect URIs:
   - Development: `http://localhost:3000/api/instagram/callback`
   - Production: `https://yourdomain.com/api/instagram/callback`

### 2. Instagram Business API (Optional)

For advanced insights, also add Instagram Graph API:
1. Add Instagram Graph API product to your Facebook app
2. Configure permissions for business accounts
3. Add webhook endpoints for real-time updates

### 3. Environment Variables

```bash
# Required for basic integration
INSTAGRAM_CLIENT_ID="your-instagram-app-id"
INSTAGRAM_APP_SECRET="your-instagram-app-secret"
INSTAGRAM_REDIRECT_URI="http://localhost:3000/api/instagram/callback"

# Required for webhooks
INSTAGRAM_WEBHOOK_VERIFY_TOKEN="your-webhook-verify-token"
INSTAGRAM_WEBHOOK_URL="http://localhost:3000/api/webhooks/instagram"
```

### 4. Database Setup

The integration uses the existing `InfluencerPlatform` model with enhanced fields:

```sql
-- Key fields for Instagram data
- igUserId: Instagram user ID
- igBusinessAccountId: Business account ID (if applicable)
- igMediaCount: Number of media posts
- igEngagementRate: Calculated engagement rate
- igAccountType: PERSONAL, BUSINESS, or CREATOR
- platformData: JSON field for detailed analytics
```

### 5. Webhook Configuration

1. Set up webhook in Facebook App settings:
   - Webhook URL: `https://yourdomain.com/api/webhooks/instagram`
   - Verify Token: Same as `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`
   - Subscribe to: `user_media` events

2. For development, use ngrok or similar tool:
   ```bash
   ngrok http 3000
   # Use the HTTPS URL for webhook configuration
   ```

## Usage

### Basic Integration

```typescript
import InstagramConnectButton from '@/components/kol/InstagramConnectButton';

// Basic usage
<InstagramConnectButton 
  isConnected={connection !== null}
  username={connection?.username}
  lastSynced={connection?.lastSynced}
/>
```

### Advanced Analytics

```typescript
// With advanced features
<InstagramConnectButton 
  isConnected={connection !== null}
  username={connection?.username}
  lastSynced={connection?.lastSynced}
  connection={connection}
  showAdvanced={true}
/>
```

### Server Actions

```typescript
import { 
  initiateInstagramAuth,
  syncInstagramData,
  advancedInstagramSync,
  getInstagramInsights 
} from '@/lib/instagram.actions';

// Basic sync
await syncInstagramData();

// Advanced sync with detailed analytics
await advancedInstagramSync();

// Get business insights (requires Business/Creator account)
await getInstagramInsights({
  since: '2024-01-01',
  until: '2024-01-31'
});
```

## API Endpoints

### Authentication Flow
- `GET /api/instagram/authorize` - Initiate OAuth flow
- `GET /api/instagram/callback` - Handle OAuth callback

### Webhooks
- `GET /api/webhooks/instagram` - Webhook verification
- `POST /api/webhooks/instagram` - Webhook event handler

## Data Structure

### Basic Profile Data
```json
{
  "id": "instagram_user_id",
  "username": "instagram_username",
  "account_type": "PERSONAL|BUSINESS|CREATOR",
  "media_count": 150,
  "followers_count": 5000
}
```

### Analytics Data
```json
{
  "engagementRate": 3.25,
  "avgLikes": 45,
  "avgComments": 8,
  "totalEngagement": 1200,
  "postFrequency": 2.5,
  "mediaTypeDistribution": {
    "IMAGE": 80,
    "VIDEO": 15,
    "CAROUSEL_ALBUM": 5
  },
  "topPerformingPost": {
    "id": "post_id",
    "like_count": 150,
    "comments_count": 25,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Troubleshooting

### Common Issues

1. **"Invalid OAuth state"**
   - Clear browser cookies and try again
   - Ensure state parameter is being stored correctly

2. **"Access token expired"**
   - Instagram tokens don't expire but can be revoked
   - Users need to reconnect their account

3. **"Business insights not available"**
   - Only Business and Creator accounts have access to insights
   - Personal accounts need to switch account type

4. **Webhook not receiving events**
   - Verify webhook URL is accessible (use ngrok for development)
   - Check that verify token matches
   - Ensure app is subscribed to correct events

### Debug Mode

Enable detailed logging by checking console output:
- OAuth flow steps
- API responses
- Webhook events
- Sync operations

## Security Considerations

- ✅ App secret is kept server-side only
- ✅ Webhook signatures are verified
- ✅ OAuth state parameter prevents CSRF
- ✅ Access tokens are stored securely
- ✅ HTTPS required in production

## Rate Limits

Instagram API has rate limits:
- Basic Display API: 200 requests/hour per user
- Graph API: Varies by endpoint
- Webhook deliveries: Real-time, no limits

## Testing

### Development Testing
1. Add test users in Facebook App > Roles
2. Test users need to accept invitation
3. Use development environment variables

### Production Testing
1. Submit app for review if targeting public users
2. Configure production webhook URLs
3. Test with real Instagram accounts

## Monitoring

Track key metrics:
- Connection success rate
- Sync operation failures
- Webhook delivery success
- API error rates

Use the audit log system to track user actions and system events.