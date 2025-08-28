'use client';

import { useState } from 'react';
import { FaYoutube } from 'react-icons/fa';
import { InfluencerPlatform } from '@prisma/client';
import Image from 'next/image';

// Tipe untuk platformData JSON
type YouTubePlatformData = {
  channelId?: string;
  description?: string;
  thumbnailUrl?: string;
};

interface YouTubeDataProps {
  connection: InfluencerPlatform;
}

export default function YouTubeData({ connection }: YouTubeDataProps) {
  const [data] = useState(connection);

  // Cast platformData agar bisa diakses sebagai objek
  const platformData = data.platformData as YouTubePlatformData;

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-4">
        {platformData?.thumbnailUrl ? (
          <Image
            src={platformData.thumbnailUrl}
            alt={`Thumbnail of ${data.username}`}
            className="h-12 w-12 rounded-full object-cover"
            width={1000}
            height={1000}
          />
        ) : (
          <div className="h-12 w-12 bg-red-600 rounded-full flex items-center justify-center">
            <FaYoutube className="h-6 w-6 text-white" />
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold">@{data.username}</h3>
          <p className="text-sm text-gray-500">
            Last synced:{' '}
            {data.lastSynced ? new Date(data.lastSynced).toLocaleString() : 'Never'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="border p-3 rounded">
          <p className="text-sm text-gray-500">Subscribers</p>
          <p className="text-xl font-bold">{data.followers.toLocaleString()}</p>
        </div>
        <div className="border p-3 rounded">
          <p className="text-sm text-gray-500">Videos</p>
          <p className="text-xl font-bold">{data.posts.toLocaleString()}</p>
        </div>
        <div className="border p-3 rounded">
          <p className="text-sm text-gray-500">Views</p>
          <p className="text-xl font-bold">{(data as any).views?.toLocaleString?.() || 0}</p>
        </div>
      </div>
    </div>
  );
}
