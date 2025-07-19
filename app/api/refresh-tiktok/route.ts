import { NextResponse } from 'next/server';
import { scheduleAutoRefresh } from '@/lib/cronjobsTiktok.actions';

export async function POST() {
  try {
    await scheduleAutoRefresh();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Background refresh failed:', error);
    return NextResponse.json({ success: false, error: 'Refresh failed' }, { status: 500 });
  }
}