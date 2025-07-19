import { NextResponse } from 'next/server';
import { getTikTokConnections } from '@/lib/tiktok.actions';

export async function GET() {
  try {
    const connections = await getTikTokConnections();
    return NextResponse.json(connections || []);
  } catch (error) {
    console.error('Failed to fetch TikTok connections:', error);
    return NextResponse.json([], { status: 500 });
  }
}