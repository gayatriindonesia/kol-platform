import { NextRequest, NextResponse } from "next/server";
import { handleInstagramCallback } from "@/lib/instagram.actions";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorReason = searchParams.get('error_reason');
  const errorDescription = searchParams.get('error_description');

  // Handle error cases
  if (error) {
    console.error('Instagram OAuth error:', {
      error,
      errorReason,
      errorDescription
    });
    
    return NextResponse.redirect(
      new URL(`/kol/platform?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    );
  }

  // Validate required parameters
  if (!code || !state) {
    console.error('Missing required parameters:', { code: !!code, state: !!state });
    return NextResponse.redirect(
      new URL('/kol/platform?error=Missing required parameters', request.url)
    );
  }

  try {
    // Handle the Instagram callback
    await handleInstagramCallback(code, state);
    
    // Redirect will be handled by handleInstagramCallback function
    // This return shouldn't be reached if redirect works properly
    // return NextResponse.redirect(new URL('/kol/platform?success=true', request.url));
    
  } catch (error) {
    console.error('Instagram callback error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    return NextResponse.redirect(
      new URL(`/kol/platform?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}