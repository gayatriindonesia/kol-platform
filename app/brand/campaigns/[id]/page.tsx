import React from 'react';
import { getCampaignById, checkCampaignExpiry } from '@/lib/campaign.actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import CampaignDetailId from '@/components/brand/Campaign/CampaignDetailId';
import CampaignListInfluencer from '@/components/brand/Campaign/CampaignListInfluencer';

interface Campaign {
    id: string;
    name?: string;
    status?: string;
    description?: string;
    target?: string;
    type?: string;
    budget?: number;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    startDate?: string | Date;
    endDate?: string | Date;
    brands?: {
        user: {
            name: string | null;
            email: string | null;
        };
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    };
}

interface CampaignResponse {
    success: boolean;
    message?: string;
    status?: number;
    campaign?: Campaign;
}

interface CampaignDetailPageProps {
    params: {
        id: string;
    };
}

export const dynamic = 'force-dynamic';

const CampaignDetailPage = async ({ params }: CampaignDetailPageProps) => {
    const { id } = params;

    try {
        // 1. Ambil data campaign
        const campaignResponse: CampaignResponse = await getCampaignById(id);

        if (!campaignResponse || !campaignResponse.success || !campaignResponse.campaign) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="container mx-auto px-4 py-8 max-w-4xl">
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                            <CardContent className="p-8 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                    <FileText className="w-8 h-8 text-red-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaign Tidak Ditemukan</h2>
                                <p className="text-red-600 mb-6">
                                    {campaignResponse?.message || 'Campaign yang Anda cari tidak ditemukan'}
                                </p>
                                <Link href="/campaigns">
                                    <Button variant="outline" size="lg" className="font-medium">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Kembali ke Daftar Campaign
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            );
        }

        let campaign = campaignResponse.campaign;
        console.log('Campaign data fetched:', campaign);

        // 2. Cek apakah campaign sudah berakhir dan perlu diupdate
        if (campaign.endDate && campaign.status === 'ACTIVE') {
            const currentDate = new Date();
            const endDate = new Date(campaign.endDate);

            // Jika campaign sudah berakhir, lakukan update
            if (endDate < currentDate) {
                console.log(`Campaign ${campaign.id} has expired, updating status...`);

                try {
                    const expiryCheckResult = await checkCampaignExpiry(campaign.id);

                    if (expiryCheckResult.success && expiryCheckResult.wasExpired) {
                        // Update status campaign di object local
                        campaign = {
                            ...campaign,
                            status: 'COMPLETED',
                            updatedAt: new Date()
                        };

                        console.log(`Campaign ${campaign.id} status updated to COMPLETE`);
                    }
                } catch (expiryError) {
                    console.error('Error checking campaign expiry:', expiryError);
                }
            }
        }

        // 3. Render component dengan data campaign yang sudah diupdate
        return (
            <>
                <CampaignDetailId campaign={campaign} />
                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    {/* Influencer Terpilih Section */}
                    <CampaignListInfluencer campaignId={campaign.id} />
                </div>
            </>
        )

    } catch (error) {
        console.error('Error fetching campaign:', error);
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                <FileText className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h2>
                            <p className="text-red-600 mb-6">Terjadi kesalahan saat memuat data campaign</p>
                            <Link href="/campaigns">
                                <Button variant="outline" size="lg" className="font-medium">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Kembali ke Daftar Campaign
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }
};

export default CampaignDetailPage;