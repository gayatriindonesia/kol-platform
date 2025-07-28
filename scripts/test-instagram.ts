#!/usr/bin/env node

/**
 * Instagram API Integration Test Script
 * This script helps verify that Instagram integration is properly configured
 */

import { PrismaClient } from '@prisma/client';
import { validateConfig } from '../lib/instagram.actions';

const prisma = new PrismaClient();

async function testInstagramSetup() {
  console.log('🔍 Testing Instagram API Integration Setup...\n');

  // 1. Check environment variables
  console.log('1. Environment Variables:');
  const envVars = {
    INSTAGRAM_CLIENT_ID: process.env.INSTAGRAM_CLIENT_ID,
    INSTAGRAM_APP_SECRET: process.env.INSTAGRAM_APP_SECRET,
    INSTAGRAM_REDIRECT_URI: process.env.INSTAGRAM_REDIRECT_URI
  };

  Object.entries(envVars).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    const display = value ? `${value.substring(0, 8)}...` : 'Not set';
    console.log(`   ${status} ${key}: ${display}`);
  });

  // 2. Check database platform records
  console.log('\n2. Database Platform Records:');
  try {
    const platforms = await prisma.platform.findMany({
      where: {
        name: {
          in: ['Instagram', 'TikTok', 'YouTube', 'Facebook']
        }
      }
    });

    const platformNames = platforms.map(p => p.name);
    ['Instagram', 'TikTok', 'YouTube', 'Facebook'].forEach(name => {
      const exists = platformNames.includes(name);
      console.log(`   ${exists ? '✅' : '❌'} ${name} platform`);
    });
  } catch (error) {
    console.log('   ❌ Database connection failed:', error.message);
  }

  // 3. Check OAuth URL generation
  console.log('\n3. OAuth Configuration:');
  try {
    if (envVars.INSTAGRAM_CLIENT_ID && envVars.INSTAGRAM_REDIRECT_URI) {
      const authUrl = new URL("https://api.instagram.com/oauth/authorize");
      authUrl.searchParams.append("client_id", envVars.INSTAGRAM_CLIENT_ID);
      authUrl.searchParams.append("redirect_uri", envVars.INSTAGRAM_REDIRECT_URI);
      authUrl.searchParams.append("scope", "user_profile,user_media");
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("state", "test_state");
      
      console.log('   ✅ OAuth URL can be generated');
      console.log(`   📋 Test URL: ${authUrl.toString()}`);
    } else {
      console.log('   ❌ Cannot generate OAuth URL - missing environment variables');
    }
  } catch (error) {
    console.log('   ❌ OAuth URL generation failed:', error.message);
  }

  // 4. Summary and recommendations
  console.log('\n4. Setup Status:');
  
  const allEnvVarsSet = Object.values(envVars).every(val => val);
  const hasInstagramPlatform = await prisma.platform.findFirst({ where: { name: 'Instagram' } });
  
  if (allEnvVarsSet && hasInstagramPlatform) {
    console.log('   ✅ Instagram integration is properly configured!');
    console.log('\n🚀 Next Steps:');
    console.log('   1. Start your development server: npm run dev');
    console.log('   2. Login as an influencer user');
    console.log('   3. Go to /kol/platform page');
    console.log('   4. Click "Connect Instagram" button');
  } else {
    console.log('   ❌ Instagram integration needs configuration');
    console.log('\n🔧 Required Actions:');
    
    if (!allEnvVarsSet) {
      console.log('   • Set up environment variables (see .env.example)');
      console.log('   • Create Facebook App with Instagram Basic Display');
    }
    
    if (!hasInstagramPlatform) {
      console.log('   • Run: npm run prisma:seed');
    }
    
    console.log('\n📖 See INSTAGRAM_SETUP.md for detailed instructions');
  }

  await prisma.$disconnect();
}

// Handle script execution
if (require.main === module) {
  testInstagramSetup()
    .catch(error => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

export { testInstagramSetup };