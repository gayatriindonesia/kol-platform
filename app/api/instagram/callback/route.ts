import { NextRequest, NextResponse } from "next/server";
import { handleInstagramCallback } from "@/lib/instagram.actions";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorReason = searchParams.get('error_reason');
  const errorDescription = searchParams.get('error_description');

  console.log('📥 Instagram callback received:', {
    hasCode: !!code,
    hasState: !!state,
    error,
    errorReason,
    errorDescription
  });

  // Handle error cases
  if (error) {
    console.error('❌ Instagram OAuth error:', {
      error,
      errorReason,
      errorDescription
    });
    
    const errorMsg = errorDescription || error || 'Instagram authentication failed';
    return NextResponse.redirect(
      new URL(`/kol/platform?instagram_error=${encodeURIComponent(errorMsg)}`, request.url)
    );
  }

  // Validate required parameters
  if (!code || !state) {
    console.error('❌ Missing required parameters:', { code: !!code, state: !!state });
    return NextResponse.redirect(
      new URL('/kol/platform?instagram_error=Missing%20required%20parameters', request.url)
    );
  }

  try {
    // Handle the Instagram callback
    console.log('🔄 Processing Instagram callback...');
    await handleInstagramCallback(code, state);
    
    // If we reach here, something went wrong with the redirect in handleInstagramCallback
    console.warn('⚠️ Callback completed but no redirect occurred');
    return NextResponse.redirect(new URL('/kol/platform?instagram_success=true', request.url));
    
  } catch (error) {
    console.error('❌ Instagram callback error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    return NextResponse.redirect(
      new URL(`/kol/platform?instagram_error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}