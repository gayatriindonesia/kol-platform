"use server";

import { db } from "./db";
import { refreshTikTokData } from "./tiktok.actions";

export async function scheduleAutoRefresh() {
  // Ambil semua koneksi yang perlu di-refresh (misalnya yang terakhir sync > 1 jam yang lalu)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const staleConnections = await db.influencerPlatform.findMany({
    where: {
      platform: {
        name: 'TikTok'
      },
      OR: [
        { lastSynced: { lt: oneHourAgo } },
        { lastSynced: null }
      ]
    },
    include: {
      influencer: true,
      platform: true
    }
  });

  console.log(`Found ${staleConnections.length} stale TikTok connections`);

  // Refresh setiap koneksi secara batch
  const refreshPromises = staleConnections.map(async (connection) => {
    try {
      await refreshTikTokData(connection.id);
      console.log(`Refreshed TikTok data for connection ${connection.id}`);
    } catch (error) {
      console.error(`Failed to refresh connection ${connection.id}:`, error);
    }
  });

  await Promise.allSettled(refreshPromises);
}