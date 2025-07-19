// app/api/campaigns/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkCampaignExpiry, getCampaignById } from '@/lib/campaign.actions';
import { auth } from '@/auth';
import { db } from '@/lib/db';

interface RouteParams {
    params: {
        id: string;
    };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = params;
        
        // Ambil data campaign
        const campaignResult = await getCampaignById(id);
        
        if (!campaignResult.success || !campaignResult.campaign) {
            return NextResponse.json(
                { success: false, error: 'Campaign not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            campaign: campaignResult.campaign
        });

    } catch (error) {
        console.error('Error getting campaign status:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = params;
        const body = await request.json();
        const { action } = body;

        if (action === 'check_expiry') {
            // Cek dan update status jika campaign sudah berakhir
            const expiryResult = await checkCampaignExpiry(id);
            
            if (!expiryResult.success) {
                return NextResponse.json(
                    { success: false, error: expiryResult.message },
                    { status: 400 }
                );
            }

            // Ambil data campaign terbaru setelah pengecekan
            const campaignResult = await getCampaignById(id);
            
            return NextResponse.json({
                success: true,
                campaign: campaignResult.campaign,
                wasExpired: expiryResult.wasExpired,
                message: expiryResult.message
            });
        }

        if (action === 'force_complete') {
            // Khusus untuk admin atau dalam kasus tertentu
            const user = await auth();
            if (!user || !user.user?.id) {
                return NextResponse.json(
                    { success: false, error: 'Unauthorized' },
                    { status: 401 }
                );
            }

            // Implementasi force complete jika diperlukan
            // Ini harus dikontrol dengan permission yang ketat
            
            return NextResponse.json({
                success: true,
                message: 'Force complete not implemented yet'
            });
        }

        return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Error updating campaign status:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Endpoint untuk batch update semua campaign yang expired
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Cek apakah user adalah admin
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            );
        }

        // Import function untuk batch update
        const { updateExpiredCampaigns } = await import('@/lib/campaign.actions');
        
        const result = await updateExpiredCampaigns();
        
        return NextResponse.json(result);

    } catch (error) {
        console.error('Error in batch update:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validasi apakah campaign exists
    const existingCampaign = await db.campaign.findUnique({
      where: { id }
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign tidak ditemukan' },
        { status: 404 }
      );
    }

    // Cek apakah campaign sudah completed
    if (existingCampaign.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Campaign sudah dalam status COMPLETED' },
        { status: 400 }
      );
    }

    // Update campaign status ke COMPLETED
    const updatedCampaign = await db.campaign.update({
      where: { id },
      data: { 
        status: 'COMPLETED',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Campaign berhasil dihentikan',
      campaign: updatedCampaign
    });

  } catch (error) {
    console.error('Error stopping campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}