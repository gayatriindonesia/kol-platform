import { NextResponse } from "next/server";
import { handleInstagramCallback } from "@/lib/instagram.actions";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    
    // Log the callback parameters for debugging
    console.log("Instagram callback received:", { 
      code: code ? "Present" : "Missing", 
      state: state ? "Present" : "Missing" 
    });
    
    if (!code || !state) {
      console.error("Missing required parameters:", { code, state });
      return NextResponse.redirect(
        new URL("/kol/error?message=Missing%20code%20or%20state", request.url)
      );
    }

    // Call the handler function which returns a redirect response
    try {
      // The original function returns a redirect, not an object
      return await handleInstagramCallback(code, state);
    } catch (error) {
      console.error("Instagram authentication error:", error);
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      return NextResponse.redirect(
        new URL(`/kol/error?message=${encodeURIComponent(errorMessage)}`, request.url)
      );
    }
  } catch (error) {
    console.error("Instagram callback route error:", error);
    const errorMessage = error instanceof Error ? error.message : "Authentication failed";
    return NextResponse.redirect(
      new URL(`/kol/error?message=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}