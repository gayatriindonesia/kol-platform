import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCampaignById, checkCampaignExpiry } from '@/lib/campaign.actions';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Clock } from 'lucide-react';
import CampaignDetailId from '@/components/brand/Campaign/CampaignDetailId';
import CampaignListInfluencer from '@/components/brand/Campaign/CampaignListInfluencer';
import BackButton from '@/components/brand/BackButton';

// Types
interface Campaign {
    id: string;
    name?: string;
    goal?: string | null;
    bankId?: string | null;
    status?: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
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

// Metadata generation
export async function generateMetadata({ params }: CampaignDetailPageProps): Promise<Metadata> {
    const { id } = params;

    try {
        const campaignResponse: CampaignResponse = await getCampaignById(id);
        const campaign = campaignResponse?.campaign;

        return {
            title: campaign?.name
                ? `${campaign.name} - Campaign Detail`
                : 'Campaign Detail',
            description: campaign?.description
                ? `${campaign.description.substring(0, 160)}...`
                : 'View campaign details and manage influencers',
        };
    } catch {
        return {
            title: 'Campaign Detail',
            description: 'Campaign detail page',
        };
    }
}

// Error boundary component
const ErrorFallback = ({
    title = "Terjadi Kesalahan",
    message = "Terjadi kesalahan saat memuat data campaign",
    showBackButton = true
}: {
    title?: string;
    message?: string;
    showBackButton?: boolean;
}) => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
                    <p className="text-red-600 mb-6">{message}</p>
                    {showBackButton && (
                        <BackButton
                            fallbackUrl="/brand/campaigns"
                            label="Kembali ke Daftar Campaign"
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
);

// Loading component
const LoadingFallback = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-6">
                <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                    <Skeleton className="h-6 w-40 mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
);

// Utility functions
const isValidCampaignId = (id: string): boolean => {
    return Boolean(
        id && id.trim().length > 0 && /^[a-zA-Z0-9_-]+$/.test(id)
    );
};


const isCampaignExpired = (endDate: string | Date): boolean => {
    const end = new Date(endDate);
    const now = new Date();
    return end < now;
};

const handleCampaignExpiryCheck = async (campaign: Campaign): Promise<Campaign> => {
    if (!campaign.endDate || campaign.status !== 'ACTIVE') {
        return campaign;
    }

    if (isCampaignExpired(campaign.endDate)) {
        console.log(`Campaign ${campaign.id} has expired, updating status...`);

        try {
            const expiryCheckResult = await checkCampaignExpiry(campaign.id);

            if (expiryCheckResult.success && expiryCheckResult.wasExpired) {
                const updatedCampaign = {
                    ...campaign,
                    status: 'COMPLETED' as const,
                    updatedAt: new Date()
                };

                console.log(`Campaign ${campaign.id} status updated to COMPLETED`);
                return updatedCampaign;
            }
        } catch (expiryError) {
            console.error('Error checking campaign expiry:', expiryError);
            // Don't throw - just log and continue with original campaign
        }
    }

    return campaign;
};

// Main component
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CampaignDetailPage = async ({ params }: CampaignDetailPageProps) => {
    const { id } = params;

    // Input validation
    if (!isValidCampaignId(id)) {
        console.error(`Invalid campaign ID provided: ${id}`);
        notFound();
    }

    try {
        // Fetch campaign data
        const campaignResponse: CampaignResponse = await getCampaignById(id);

        // Handle API response errors
        if (!campaignResponse) {
            throw new Error('No response received from campaign service');
        }

        if (!campaignResponse.success) {
            const errorMessage = campaignResponse.message || 'Failed to fetch campaign data';
            console.error(`Campaign fetch failed: ${errorMessage}`, {
                campaignId: id,
                status: campaignResponse.status
            });

            // Handle specific error cases
            if (campaignResponse.status === 404) {
                notFound();
            }

            return (
                <ErrorFallback
                    title="Campaign Tidak Ditemukan"
                    message={errorMessage}
                />
            );
        }

        if (!campaignResponse.campaign) {
            console.error('Campaign data is missing from successful response');
            notFound();
        }

        // Process campaign data
        let campaign = campaignResponse.campaign;

        // Log campaign data for debugging (remove in production)
        if (process.env.NODE_ENV === 'development') {
            console.log('Campaign data fetched:', {
                id: campaign.id,
                name: campaign.name,
                status: campaign.status,
                endDate: campaign.endDate
            });
        }

        // Handle campaign expiry check
        campaign = await handleCampaignExpiryCheck(campaign);

        // Render success state
        return (
            <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <Suspense fallback={<LoadingFallback />}>
                    <div>
                        <CampaignDetailId campaign={campaign} />
                    </div>

                    <div className="w-full px-4 py-8">
                        <section aria-label="Campaign Influencers">
                            <CampaignListInfluencer campaignId={campaign.id} />
                        </section>
                    </div>

                </Suspense>

                {/* Status indicator for expired campaigns */}
                {campaign.status === 'COMPLETED' && campaign.endDate && isCampaignExpired(campaign.endDate) && (
                    <div className="fixed bottom-4 right-4 z-50">
                        <Alert className="w-auto bg-yellow-50 border-yellow-200">
                            <Clock className="h-4 w-4" />
                            <AlertDescription className="text-yellow-800">
                                Campaign telah berakhir dan statusnya telah diperbarui
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
            </main>
        );

    } catch (error) {
        console.error('Unexpected error in CampaignDetailPage:', error);

        // Determine error type and provide appropriate response
        const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
        const errorTitle = isNetworkError ? "Koneksi Bermasalah" : "Terjadi Kesalahan";
        const errorMessage = isNetworkError
            ? "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
            : "Terjadi kesalahan tak terduga saat memuat data campaign";

        return (
            <ErrorFallback
                title={errorTitle}
                message={errorMessage}
            />
        );
    }
};

export default CampaignDetailPage;