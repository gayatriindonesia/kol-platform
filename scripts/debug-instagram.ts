#!/usr/bin/env ts-node

/**
 * Instagram Configuration Debug Script
 * Run this to verify your Instagram API setup
 */

// Load environment variables
require('dotenv').config();

interface Config {
  INSTAGRAM_CLIENT_ID?: string;
  INSTAGRAM_APP_SECRET?: string;
  INSTAGRAM_REDIRECT_URI?: string;
  FACEBOOK_CLIENT_ID?: string;
  FACEBOOK_APP_SECRET?: string;
  NEXTAUTH_URL?: string;
}

function debugInstagramConfig() {
  console.log('🔍 Instagram Configuration Debug\n');
  
  const config: Config = {
    INSTAGRAM_CLIENT_ID: process.env.INSTAGRAM_CLIENT_ID,
    INSTAGRAM_APP_SECRET: process.env.INSTAGRAM_APP_SECRET,
    INSTAGRAM_REDIRECT_URI: process.env.INSTAGRAM_REDIRECT_URI,
    FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
    FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  };

  // Check required variables
  console.log('📋 Environment Variables:');
  console.log(`INSTAGRAM_CLIENT_ID: ${config.INSTAGRAM_CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`INSTAGRAM_APP_SECRET: ${config.INSTAGRAM_APP_SECRET ? '✅ Set' : '❌ Missing'}`);
  console.log(`INSTAGRAM_REDIRECT_URI: ${config.INSTAGRAM_REDIRECT_URI ? '✅ Set' : '❌ Missing'}`);
  console.log(`FACEBOOK_CLIENT_ID: ${config.FACEBOOK_CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`NEXTAUTH_URL: ${config.NEXTAUTH_URL ? '✅ Set' : '❌ Missing'}\n`);

  // Check App ID consistency
  console.log('🔗 App ID Consistency Check:');
  if (config.INSTAGRAM_CLIENT_ID && config.FACEBOOK_CLIENT_ID) {
    if (config.INSTAGRAM_CLIENT_ID === config.FACEBOOK_CLIENT_ID) {
      console.log('✅ Instagram and Facebook use the same App ID (Recommended)');
    } else {
      console.log('⚠️  Instagram and Facebook use different App IDs');
      console.log(`   Instagram: ${config.INSTAGRAM_CLIENT_ID}`);
      console.log(`   Facebook: ${config.FACEBOOK_CLIENT_ID}`);
      console.log('   Consider using the same Facebook App for both services');
    }
  }
  console.log('');

  // Check redirect URI
  console.log('🌐 Redirect URI Analysis:');
  if (config.INSTAGRAM_REDIRECT_URI) {
    const uri = config.INSTAGRAM_REDIRECT_URI;
    console.log(`Current URI: ${uri}`);
    
    if (uri.startsWith('https://')) {
      console.log('✅ Uses HTTPS (Required for production)');
    } else if (uri.startsWith('http://localhost')) {
      console.log('⚠️  Uses HTTP localhost (OK for development only)');
    } else {
      console.log('❌ Invalid protocol - must use HTTPS or localhost');
    }
    
    if (uri.endsWith('/api/instagram/callback')) {
      console.log('✅ Correct callback path');
    } else {
      console.log('❌ Incorrect callback path - should end with /api/instagram/callback');
    }
    
    if (uri.includes(' ') || uri.includes('\n') || uri.includes('\t')) {
      console.log('❌ URI contains whitespace characters');
    } else {
      console.log('✅ URI format looks clean');
    }
  }
  console.log('');

  // Generate test URLs
  console.log('🧪 Test URLs:');
  if (config.INSTAGRAM_CLIENT_ID && config.INSTAGRAM_REDIRECT_URI) {
    const authUrl = `https://api.instagram.com/oauth/authorize?` +
      `client_id=${config.INSTAGRAM_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(config.INSTAGRAM_REDIRECT_URI)}&` +
      `scope=user_profile,user_media&` +
      `response_type=code&` +
      `state=debug_test`;
    
    console.log('Test OAuth URL:');
    console.log(authUrl);
    console.log('\n👆 Copy this URL to test Instagram OAuth manually\n');
  }

  // Configuration recommendations
  console.log('💡 Recommendations:');
  
  if (config.INSTAGRAM_CLIENT_ID !== config.FACEBOOK_CLIENT_ID) {
    console.log('1. Use the same Facebook App ID for both Instagram and Facebook integrations');
    console.log('   Update INSTAGRAM_CLIENT_ID to match FACEBOOK_CLIENT_ID');
  }
  
  if (config.INSTAGRAM_REDIRECT_URI && !config.INSTAGRAM_REDIRECT_URI.startsWith('https://') && !config.INSTAGRAM_REDIRECT_URI.includes('localhost')) {
    console.log('2. Use HTTPS for production redirect URIs');
  }
  
  console.log('3. Ensure Instagram Basic Display is added to your Facebook App');
  console.log('4. Add test users in Facebook App > Roles > Instagram Testers (for development)');
  console.log('5. Verify redirect URI exactly matches Facebook App settings');
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Go to https://developers.facebook.com/apps/');
  console.log(`2. Open your Facebook App (${config.FACEBOOK_CLIENT_ID})`);
  console.log('3. Add "Instagram Basic Display" product if not already added');
  console.log('4. Configure OAuth redirect URI to match your environment');
  console.log('5. Copy the Instagram App ID and Secret to your .env file');
  
  console.log('\n🚀 After fixing configuration, restart your application and test again.');
}

// Run the debug function
debugInstagramConfig();