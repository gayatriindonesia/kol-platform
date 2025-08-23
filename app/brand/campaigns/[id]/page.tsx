import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCampaignById, checkCampaignExpiry } from '@/lib/campaign.actions';
import { getMOUByCampaignId } from '@/lib/mou.actions'; // Add this import
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Clock } from 'lucide-react';
import CampaignDetailId from '@/components/brand/Campaign/CampaignDetailId';
import CampaignListInfluencer from '@/components/brand/Campaign/CampaignListInfluencer';
import BackButton from '@/components/brand/BackButton';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import MOURequestComponent from '@/components/brand/Mou/RequestMou';

// Types - Updated to match actual database structure
interface Campaign {
    id: string;
    name: string;
    goal?: string | null;
    bankId?: string | null;
    status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
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
    mouRequired: boolean;
    canStartWithoutMOU: boolean;
    // Add MOU relation fields
    mou?: {
        id: string;
        status: string;
        brandApprovalStatus: string;
        influencerApprovalStatus: string;
        adminApprovalStatus: string;
        createdAt: Date;
        mouNumber: string;
    } | null;
    // Match the exact structure expected by MOURequestComponent
    CampaignInvitation?: Array<{
        id: string;
        campaignId: string;
        influencerId: string;
        status: string;
        message?: string | null;
        responseMessage?: string | null;
        invitedAt: Date;
        respondedAt?: Date | null;
        brandId: string;
        createdAt: Date;
        updatedAt: Date;
        mouCreationRequested?: boolean;
        mouCreatedAt?: Date | null;
        mouCreatedBy?: string | null;
        influencer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            user: {
                id: string;
                name: string | null;
                email: string | null;
            };
        };
    }>;
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
        console.log("respon data", campaign)

        return {
            title: campaign?.name
                ? `${campaign.name} - Campaign Detail`
                : 'Campaign Detail',
            description: campaign?.goal
                ? `${campaign.goal.substring(0, 160)}...`
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
        // Get session to determine user role
        const session = await auth();
        if (!session?.user?.id) {
            notFound();
        }

        // Get user role
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!user) {
            notFound();
        }

        // Fetch campaign data first
        const campaignResponse: CampaignResponse = await getCampaignById(id);

        // Handle API response errors for campaign
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

        // Try to fetch MOU data separately (optional, don't fail if MOU doesn't exist)
        try {
            const mouResponse = await getMOUByCampaignId(id);
            if (mouResponse.success && mouResponse.data) {
                campaign = {
                    ...campaign,
                    mou: {
                        id: mouResponse.data.id,
                        status: mouResponse.data.status,
                        brandApprovalStatus: mouResponse.data.brandApprovalStatus,
                        influencerApprovalStatus: mouResponse.data.influencerApprovalStatus,
                        adminApprovalStatus: mouResponse.data.adminApprovalStatus,
                        createdAt: mouResponse.data.createdAt,
                        mouNumber: mouResponse.data.mouNumber
                    }
                };
            }
        } catch (mouError) {
            // Don't fail the entire page if MOU fetch fails
            console.warn('Failed to fetch MOU data:', mouError);
        }

        console.log(campaign, "ini data detail campaign with MOU")

        // Handle campaign expiry check
        campaign = await handleCampaignExpiryCheck(campaign);

        const showMOUComponent = (
            user.role === 'BRAND' || 
            user.role === 'INFLUENCER' || 
            user.role === 'ADMIN'
        ) && campaign.status === 'ACTIVE';

        // Render success state
        return (
            <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <Suspense fallback={<LoadingFallback />}>
                    <div>
                        <CampaignDetailId campaign={campaign} />
                    </div>

                    {/* MOU Request Section */}
                    {showMOUComponent && campaign.mouRequired && (
                        <div className="container mx-auto px-4 py-6 max-w-6xl">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    {/* MOU Details Display */}
                                    {campaign.mou && (
                                        <Card className="mb-6">
                                            <CardContent className="p-6">
                                                <h3 className="text-lg font-semibold mb-4">MOU Information</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-medium">MOU Number:</span>
                                                        <p className="text-gray-600">{campaign.mou.mouNumber}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Status:</span>
                                                        <p className="text-gray-600">{campaign.mou.status}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Brand Approval:</span>
                                                        <p className="text-gray-600">{campaign.mou.brandApprovalStatus}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Influencer Approval:</span>
                                                        <p className="text-gray-600">{campaign.mou.influencerApprovalStatus}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Admin Approval:</span>
                                                        <p className="text-gray-600">{campaign.mou.adminApprovalStatus}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Created:</span>
                                                        <p className="text-gray-600">{new Date(campaign.mou.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                                <div className="lg:col-span-1">
                                    <MOURequestComponent
                                        campaign={campaign}
                                        userRole={user.role as 'BRAND' | 'INFLUENCER' | 'ADMIN'}
                                        userId={session.user.id}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

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