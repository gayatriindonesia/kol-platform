// app/api/facebook/callback/route.ts - Updated Route Handler
import { NextRequest, NextResponse } from "next/server";
import { handleFacebookCallback } from "@/lib/facebook.actions";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorReason = searchParams.get('error_reason');
  const errorDescription = searchParams.get('error_description');
  
  console.log('[Facebook Callback] Received parameters:', {
    hasCode: !!code,
    hasState: !!state,
    error,
    errorReason,
    errorDescription
  });
  
  // Handle error cases
  if (error) {
    console.error('Facebook OAuth error:', {
      error,
      errorReason,
      errorDescription
    });
   
    const params = new URLSearchParams({
      success: 'false',
      message: errorDescription || `Facebook error: ${error}`
    });
    
    return NextResponse.redirect(
      new URL(`/kol/platform?${params.toString()}`, request.url)
    );
  }
  
  // Validate required parameters
  if (!code) {
    console.error('Missing authorization code');
    const params = new URLSearchParams({
      success: 'false',
      message: 'Authorization code tidak diterima dari Facebook'
    });
    
    return NextResponse.redirect(
      new URL(`/kol/platform?${params.toString()}`, request.url)
    );
  }
  
  try {
    // Handle the Facebook callback - this will redirect automatically
    await handleFacebookCallback(code, state || undefined);
    
    // This line should not be reached due to redirect in handleFacebookCallback
    return NextResponse.redirect(
      new URL('/kol/platform?success=true&message=Facebook connected', request.url)
    );
   
  } catch (error) {
    console.error('Facebook callback error:', error);
   
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    const params = new URLSearchParams({
      success: 'false',
      message: errorMessage
    });
    
    return NextResponse.redirect(
      new URL(`/kol/platform?${params.toString()}`, request.url)
    );
  }
}