import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { createNotification } from '@/lib/notification.actions';

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