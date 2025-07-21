import React from 'react';
import { getCampaignInfluencersById } from '@/lib/campaign.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function CampaignListInfluencer({ campaignId }: { campaignId: string }) {
    const result = await getCampaignInfluencersById(campaignId);

    if (!result.success || !result.data) {
        return (
            <p className="text-sm text-gray-500">Gagal memuat influencer.</p>
        );
    }

    const influencers = result.data;

    return (
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Influencer Terpilih
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {influencers.length === 0 ? (
                    <p className="text-gray-600 text-sm">Belum ada influencer yang dipilih untuk campaign ini.</p>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {influencers.map((inf) => (
                            <div
                                key={inf.id}
                                className="flex items-start gap-4 bg-gray-50 p-4 rounded-xl border shadow-sm"
                            >
                                <img
                                    src={inf.user.image || `https://ui-avatars.com/api/?name=${inf.user.name}&background=random`}
                                    alt={inf.user.name || 'Influencer Avatar'}
                                    className="w-14 h-14 rounded-full object-cover border"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{inf.user.name}</h3>
                                            <p className="text-sm text-gray-500">{inf.user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600 mt-2">
                                        <p>Platform: <span className="font-medium">{inf.platforms?.[0]?.platform.name}</span></p>
                                        <p>Post: <span className="font-medium">{inf.platforms?.[0]?.posts}</span></p>
                                        <p>Followers: <span className="font-medium">{inf.platforms?.[0]?.followers.toLocaleString()}</span></p>
                                        <p>Engagement Rate: <span className="font-medium">{inf.platforms?.[0]?.engagementRate}%</span></p>
                                    </div>

                                    {/* Button Lihat Influencer */}
                                    <div className="mt-3">
                                        <Link href={`/brand/influencer/${inf.influencerId}`} className="inline-block">
                                            <Button variant="outline" size="sm">Lihat Influencer</Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                )}
            </CardContent>
        </Card>
    );
}
