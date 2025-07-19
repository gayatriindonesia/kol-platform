import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { handleTikTokCallback } from "@/lib/tiktok.actions";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle error from TikTok
  if (error) {
    console.error(`TikTok auth error: ${error} - ${errorDescription}`);
    return redirect(`/kol/platform?error=${encodeURIComponent(errorDescription || error)}`);
  }

  // Validate required parameters
  if (!code || !state) {
    return redirect('/kol/platform?error=Invalid+request');
  }

  try {
    // Process the callback
    const result = await handleTikTokCallback(code, state);

    if (result.success) {
      return redirect('/kol/platform?success=TikTok+connected+successfully');
    } else {
      return redirect(`/kol/platform?error=${encodeURIComponent(result.error || 'Failed to connect TikTok')}`);
    }
  } catch (error: any) {
    console.error('TikTok callback handler error:', error);
    // Log the error type and stack for better debugging
    console.error('Error type:', error.constructor.name);
    console.error('Error stack:', error.stack);
    return redirect('/kol/platform?error=An+unexpected+error+occurred');
  }
}