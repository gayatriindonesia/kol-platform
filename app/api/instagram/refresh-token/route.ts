import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * Refresh Instagram access token
 * Instagram Basic Display tokens do not expire, but this endpoint
 * can be used for future token refresh functionality
 */
export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find the user's Instagram connection
    const influencer = await db.influencer.findUnique({
      where: { userId: session.user.id }
    });

    if (!influencer) {
      return NextResponse.json(
        { error: 'Influencer profile not found' },
        { status: 404 }
      );
    }

    const instagramPlatform = await db.platform.findFirst({
      where: { name: "Instagram" }
    });

    if (!instagramPlatform) {
      return NextResponse.json(
        { error: 'Instagram platform not found' },
        { status: 404 }
      );
    }

    const connection = await db.influencerPlatform.findFirst({
      where: {
        influencerId: influencer.id,
        platformId: instagramPlatform.id
      }
    });

    if (!connection || !connection.accessToken) {
      return NextResponse.json(
        { error: 'Instagram not connected' },
        { status: 404 }
      );
    }

    // Instagram Basic Display tokens don't expire, but we can validate them
    try {
      const validationResponse = await fetch(
        `https://graph.instagram.com/me?fields=id&access_token=${connection.accessToken}`
      );

      if (!validationResponse.ok) {
        return NextResponse.json(
          { error: 'Access token is invalid or expired', needsReconnection: true },
          { status: 400 }
        );
      }

      const validationData = await validationResponse.json();
      
      if (validationData.error) {
        return NextResponse.json(
          { error: 'Access token is invalid or expired', needsReconnection: true },
          { status: 400 }
        );
      }

      // Token is valid, update last validated timestamp
      await db.influencerPlatform.update({
        where: { id: connection.id },
        data: {
          lastSynced: new Date(),
          platformData: {
            ...(connection.platformData as any || {}),
            lastTokenValidation: new Date().toISOString(),
            tokenStatus: 'valid'
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Token is valid and active',
        data: {
          tokenStatus: 'valid',
          lastValidated: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Token validation error:', error);
      return NextResponse.json(
        { error: 'Failed to validate token', needsReconnection: true },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}