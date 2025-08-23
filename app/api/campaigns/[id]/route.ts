import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { createNotification } from '@/lib/notification.actions';
import { CampaignMetricsService } from '@/services/campaignMetrics';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const campaignId = params.id;
    const { status } = await request.json();

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Cek apakah user memiliki akses ke campaign ini
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let campaign;

    if (user.role === 'ADMIN') {
      // Admin dapat mengupdate campaign manapun
      campaign = await db.campaign.findUnique({
        where: { id: campaignId },
        include: {
          brands: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        }
      });
    } else {
      // Brand hanya dapat mengupdate campaign mereka sendiri
      const brand = await db.brand.findFirst({
        where: { userId: session.user.id }
      });

      if (!brand) {
        return NextResponse.json(
          { error: 'Brand not found' },
          { status: 404 }
        );
      }

      campaign = await db.campaign.findFirst({
        where: {
          id: campaignId,
          brandId: brand.id
        },
        include: {
          brands: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        }
      });
    }

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update campaign status
    const updatedCampaign = await db.campaign.update({
      where: { id: campaignId },
      data: {
        status: status as any, // Cast to enum type
        updatedAt: new Date()
      }
    });

    // Jika campaign di-COMPLETE, update semua invitation yang masih ACTIVE
    if (status === 'COMPLETED') {
      await db.campaignInvitation.updateMany({
        where: {
          campaignId: campaignId,
          status: 'ACTIVE'
        },
        data: {
          status: 'COMPLETED',
          updatedAt: new Date()
        }
      });

      // Kirim notifikasi ke semua influencer yang terlibat
      const activeInvitations = await db.campaignInvitation.findMany({
        where: {
          campaignId: campaignId,
          status: 'COMPLETED'
        },
        include: {
          influencer: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });

      // Kirim notifikasi ke setiap influencer
      for (const invitation of activeInvitations) {
        try {
          await createNotification({
            userId: invitation.influencer.user.id,
            type: 'SYSTEM',
            title: 'Campaign Completed',
            message: `Campaign "${campaign.name}" has been completed by the brand`,
            data: {
              campaignId: campaign.id,
              invitationId: invitation.id,
              completedAt: new Date().toISOString()
            }
          });
        } catch (notifError) {
          console.error('Failed to send notification to influencer:', notifError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign status updated successfully',
      data: updatedCampaign
    });

  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Campaign Metrics Data
const metricsService = new CampaignMetricsService();
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get("campaignId");
    const refresh = searchParams.get("refresh") === "true";

    // Validasi campaignId
    if (!campaignId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campaign ID is required'
        },
        { status: 400 }
      );
    }

    // Coba ambil metrics yang sudah disimpan dulu
    let metrics = await metricsService.getCampaignMetrics(campaignId);
    
    // Jika belum ada atau perlu refresh, hitung ulang
    if (!metrics || refresh) {
      metrics = await metricsService.calculateCampaignMetrics(campaignId);
    }

    return NextResponse.json({
      success: true,
      data: {
        campaignId,
        metrics: {
          reachRate: {
            value: metrics.reachRate,
            label: `${metrics.reachRate.toFixed(2)}%`,
            description: 'Persentase reach terhadap impressions'
          },
          engagementRate: {
            value: metrics.engagementRate,
            label: `${metrics.engagementRate.toFixed(2)}%`, 
            description: 'Persentase engagement terhadap reach'
          },
          responseRate: {
            value: metrics.responseRate,
            label: `${metrics.responseRate.toFixed(2)}%`,
            description: 'Persentase influencer yang merespons invitation'
          },
          completionRate: {
            value: metrics.completionRate,
            label: `${metrics.completionRate.toFixed(2)}%`,
            description: 'Persentase deliverables yang selesai'
          },
          onTimeDeliveryRate: {
            value: metrics.onTimeDeliveryRate,
            label: `${metrics.onTimeDeliveryRate.toFixed(2)}%`,
            description: 'Persentase deliverables yang tepat waktu'
          }
        },
        rawData: metrics.rawData
      }
    });

  } catch (error) {
    console.error('Error fetching campaign metrics:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch campaign metrics'
      },
      { status: 500 }
    );
  }
}