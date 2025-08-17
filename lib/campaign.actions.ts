"use server";

import { CampaignFormData } from "@/types/campaign";
import { Prisma, CampaignStatus, CampaignInvitation, MetricType } from "@prisma/client";
import { db } from "./db";
import { auth } from "@/auth";
import { generateId } from '@/lib/utils';
import { createNotification } from "./notification.actions";
import { sendCampaignNotification } from "./mail";
import { revalidatePath } from "next/cache";

type SendCampaignInvitationInput = {
  campaignId: string
  influencerIds: string[]
  brandId: string
  message?: string
}

type InvitationResponse = 'ACCEPTED' | 'REJECTED'

type RespondToCampaignInvitationInput = {
  invitationId: string
  influencerId: string
  response: InvitationResponse
  message?: string
}

type CampaignInvitationWithRelations = Prisma.CampaignInvitationGetPayload<{
  include: {
    campaign: true; // or use select if you want specific fields
    brand: {
      include: {
        user: {
          select: {
            name: true;
            email: true;
          }
        }
      }
    }
  }
}>;

type GetInfluencerInvitationsResult =
  | { success: true; data: CampaignInvitationWithRelations[] }
  | { success: false; error: string }

export const createCampaign = async (data: CampaignFormData) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const brand = await db.brand.findUnique({
      where: {
        id: data.brandId,
        userId: session.user.id
      }
    });

    if (!brand) {
      return { success: false, message: "Brand not found" };
    }

    // Validasi wajib
    if (!data.name) throw new Error("Nama campaign wajib diisi");
    if (!data.brandId) throw new Error("Brand wajib dipilih");

    // Persiapkan data untuk DIRECT campaign dengan platformSelections
    const directData = data.campaignType === 'DIRECT' ?
      (JSON.parse(JSON.stringify({
        personalInfo: data.personalInfo,
        experienceInfo: data.experienceInfo,
        educationBackground: data.educationBackground,
        budget: data.direct?.budget,
        targetAudience: data.direct?.targetAudience,
        categories: data.direct?.categories?.map(c => ({
          id: c.id,
          name: c.name,
          description: c.description
        })),
        // Tambahkan platform selections di sini
        platformSelections: data.direct?.platformSelections?.filter(platform =>
          platform.platformId && platform.serviceId && platform.follower
        ) || []
      })) as Prisma.InputJsonValue) :
      Prisma.JsonNull;

    const campaignData = {
      name: data.name,
      goal: data.goal,
      type: data.campaignType,
      brandId: data.brandId,
      startDate: data.startDate,
      endDate: data.endDate,
      directData: directData,
      selfServiceData: data.campaignType === 'SELF_SERVICE' ?
        ({
          personalInfo: data.personalInfo,
          influencerId: data.selfService?.[0]?.influencerId
        } as Prisma.InputJsonValue) :
        Prisma.JsonNull
    };

    const res = await db.campaign.create({ data: campaignData });

    return { success: true, data: { id: res.id }, message: "Campaign created successfully" };
  } catch (error) {
    console.error("Error creating campaign:", error);
    return {
      success: false,
      message: "Failed to create campaign"
    };
  }
};

// GET ALL Campaign Fllter Role
export const getAllCampaign = async () => {
  try {
    // request session
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: 'Unauthorized' };
    }

    // check User Role 
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: { role: true }
    });

    // check user ready
    if (!user) {
      return { success: false, message: 'User not found!' };
    }

    let campaigns;

    if (user.role === 'ADMIN') {
      // Admin can see all campaigns
      campaigns = await db.campaign.findMany({
        include: {
          brands: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      // Non-Admin role
      const brands = await db.brand.findMany({
        where: { userId: session.user.id },
        select: { id: true }
      });

      // check if user has any brands
      if (brands.length === 0) {
        return {
          success: true,
          data: [],
          message: 'No brands found for this user'
        };
      }

      // Extract array of brand IDs
      const brandIds = brands.map(brand => brand.id);

      campaigns = await db.campaign.findMany({
        where: {
          brandId: { in: brandIds }
        },
        include: {
          brands: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    return {
      success: true,
      data: campaigns,
      status: 200
    };

  } catch (error) {
    console.error("Error getting campaigns:", error);
    return {
      success: false,
      message: "Failed to get campaigns",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// DETAIL CAMPAIGN BY ID
export const getCampaignById = async (campaignId: string) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    let campaign;

    if (user.role === 'ADMIN') {
      // Admin can see any campaign
      campaign = await db.campaign.findUnique({
        where: { id: campaignId },
        include: {
          brands: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
        }
      });
    } else {
      // Non-admin users (Brand) can only see their own campaigns
      const brand = await db.brand.findFirst({
        where: { userId: session.user.id }
      });

      if (!brand) {
        return { success: false, message: "Brand not found" };
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
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
        }
      });
    }

    if (!campaign) {
      return { success: false, message: "Campaign not found" };
    }

    return { success: true, campaign };
  } catch (error) {
    console.error("Error getting campaign:", error);
    return {
      success: false,
      message: "Failed to get campaign"
    };
  }
};

// UPDATE CAMPAIGN
export const updateCampaign = async (campaignId: string, data: Partial<CampaignFormData & { name: string }>) => {
  try {
    // ... validasi session dan authorization tetap sama

    const updateData: Prisma.CampaignUpdateInput = {}; // Gunakan type Prisma

    if (data.name) {
      updateData.name = data.name;
    }

    if (data.campaignType) {
      updateData.type = data.campaignType;
    }

    if (data.campaignType === 'DIRECT' && data.direct) {
      // Bersihkan data undefined dan konversi ke JSON
      const directData = {
        personalInfo: data.personalInfo || {},
        experienceInfo: data.experienceInfo || { fresher: false, experiences: [] },
        educationBackground: data.educationBackground || { educations: [] },
        budget: data.direct.budget,
        targetAudience: data.direct.targetAudience,
        categories: data.direct.categories?.map(c => ({
          id: c.id,
          name: c.name,
          description: c.description
        }))
      };

      // Filter out undefined values
      const cleanedDirectData = Object.fromEntries(
        Object.entries(directData).filter(([, v]) => v !== undefined)
      );

      updateData.directData = cleanedDirectData as Prisma.InputJsonValue;
      updateData.selfServiceData = Prisma.JsonNull;
    }

    if (data.campaignType === 'SELF_SERVICE' && data.selfService) {
      const selfServiceData = {
        personalInfo: data.personalInfo || {},
        influencerId: data.selfService[0]?.influencerId
      };

      updateData.selfServiceData = selfServiceData as Prisma.InputJsonValue;
      updateData.directData = Prisma.JsonNull;
    }

    const updatedCampaign = await db.campaign.update({
      where: { id: campaignId },
      data: updateData
    });

    return { success: true, campaign: updatedCampaign };
  } catch (error) {
    console.error("Error updating campaign:", error);
    return {
      success: false,
      message: "Failed to update campaign"
    };
  }
};

// DELETE CAMPAIGN
export const deleteCampaign = async (campaignId: string) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Check if user owns this campaign (non-admin users)
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    let campaign;

    if (user.role === 'ADMIN') {
      // Admin can delete any campaign
      campaign = await db.campaign.findUnique({
        where: { id: campaignId }
      });
    } else {
      // Non-admin users (Brand) can only delete their own campaigns
      const brand = await db.brand.findFirst({
        where: { userId: session.user.id }
      });

      if (!brand) {
        return { success: false, message: "Brand not found" };
      }

      campaign = await db.campaign.findFirst({
        where: {
          id: campaignId,
          brandId: brand.id
        }
      });
    }

    if (!campaign) {
      return { success: false, message: "Campaign not found or unauthorized" };
    }

    await db.campaign.delete({
      where: { id: campaignId }
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return {
      success: false,
      message: "Failed to delete campaign"
    };
  }
};

// Approve Campaign Invitation
// Setelah disetujui, ubah status campaign jadi ACTIVE jika semua sudah ada yang approve (atau 1 cukup)

export async function sendCampaignInvitation({
  campaignId,
  influencerIds,
  brandId,
  message,
}: SendCampaignInvitationInput): Promise<{
  success: boolean
  message?: string
  data?: CampaignInvitation[]
  error?: string
}> {
  try {
    const invitations: CampaignInvitation[] = []

    for (const influencerId of influencerIds) {
      const invitation = await db.campaignInvitation.create({
        data: {
          id: generateId(),
          campaignId,
          influencerId,
          brandId,
          message,
          status: CampaignStatus.PENDING,
          updatedAt: new Date()
        },
      })

      invitations.push(invitation);

      // Ambil data user (influencer)
      const user = await db.user.findUnique({
        where: { id: influencerId },
        select: { email: true, name: true, role: true },
      });

      if (!user) {
        console.warn(`User not found for influencer ID: ${influencerId}`);
        continue;
      }

      // Buat notifikasi di database
      await createNotification({
        userId: influencerId,
        // role: UserRole.INFLUENCER,
        type: 'INVITATION',
        title: 'New Campaign Invitation',
        message: `You have received a new campaign invitation`,
        data: {
          campaignId,
          invitationId: invitation.id,
          brandId,
        },
      })
      // Kirim email via Resend
      if (user.email) {
        await sendCampaignNotification(user.email);
      }
    }

    return {
      success: true,
      message: 'Campaign invitations sent successfully',
      data: invitations,
    }
  } catch (error: any) {
    console.error('Error sending campaign invitations:', error)
    return {
      success: false,
      error: error.message ?? 'Failed to send campaign invitations',
    }
  }
}

// Tambahkan function debug ini untuk mengecek data
export async function debugCampaignInvitation(invitationId: string, influencerId: string) {
  try {
    console.log('=== DEBUG CAMPAIGN INVITATION ===');
    console.log('Input params:', { invitationId, influencerId });

    // 1. Cek apakah invitation dengan ID ini ada
    const invitationById = await db.campaignInvitation.findUnique({
      where: { id: invitationId },
      include: {
        campaign: true,
        brand: true
      }
    });

    console.log('Invitation by ID:', invitationById);

    // 2. Cek semua invitation untuk influencer ini
    const allInvitations = await db.campaignInvitation.findMany({
      where: { influencerId },
      select: {
        id: true,
        status: true,
        influencerId: true,
        campaignId: true,
        createdAt: true
      }
    });

    console.log('All invitations for influencer:', allInvitations);

    // 3. Cek invitation dengan status PENDING saja
    const pendingInvitations = await db.campaignInvitation.findMany({
      where: {
        influencerId,
        status: 'PENDING' // Gunakan string literal dulu
      }
    });

    console.log('Pending invitations:', pendingInvitations);

    return {
      invitationById,
      allInvitations,
      pendingInvitations
    };

  } catch (error) {
    console.error('Debug error:', error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export async function respondToCampaignInvitation({
  invitationId,
  influencerId,
  response,
  message,
}: RespondToCampaignInvitationInput): Promise<{
  success: boolean
  message?: string
  data?: CampaignInvitation
  error?: string
}> {
  try {
    console.log('=== respondToCampaignInvitation FIXED ===');
    console.log('Input:', { invitationId, influencerId, response, message });

    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized - Please login again',
      };
    }

    // PERBAIKAN: Cari invitation tanpa filter status dulu untuk debugging
    const invitation = await db.campaignInvitation.findFirst({
      where: {
        id: invitationId,
        influencerId,
      },
      include: {
        campaign: true,
        brand: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
      },
    });

    console.log('Found invitation (without status filter):', invitation);

    if (!invitation) {
      // Jalankan debug function
      const debugResult = await debugCampaignInvitation(invitationId, influencerId);
      console.log('Debug result:', debugResult);

      return {
        success: false,
        error: 'Invitation not found. Check console for debug info.',
      };
    }

    // Cek apakah invitation sudah di-respond
    if (invitation.status !== 'PENDING') {
      return {
        success: false,
        error: `Invitation already ${invitation.status.toLowerCase()}`,
      };
    }

    // Lanjutkan dengan update seperti biasa
    const newStatus = response === 'ACCEPTED' ? 'ACTIVE' : 'REJECTED';

    const updatedInvitation = await db.campaignInvitation.update({
      where: { id: invitationId },
      data: {
        status: newStatus as CampaignStatus,
        responseMessage: message || null,
        respondedAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        campaign: true,
        brand: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
      }
    });

    // Update campaign status
    if (newStatus === 'ACTIVE') {
      await db.campaign.update({
        where: { id: invitation.campaignId },
        data: {
          status: 'ACTIVE',
          updatedAt: new Date(),
        }
      });
    }

    // Handle rejection
    if (response === 'REJECTED') {
      const remainingInvitations = await db.campaignInvitation.findMany({
        where: {
          campaignId: invitation.campaignId,
          status: {
            in: ['PENDING', 'ACTIVE']
          }
        }
      });

      if (remainingInvitations.length === 0) {
        await db.campaign.update({
          where: { id: invitation.campaignId },
          data: {
            status: 'REJECTED',
            updatedAt: new Date(),
          }
        });
      }
    }

    // Send notification
    try {
      await createNotification({
        userId: invitation.brand.userId,
        type: 'INVITATION',
        title: `Undangan Campaign ${response}`,
        message: `Respon dari Influencer untuk Campaign anda ${response.toLowerCase()}`,
        data: {
          campaignId: invitation.campaignId,
          invitationId,
          response,
          influencerId,
        },
      });
    } catch (notifError) {
      console.error('⚠️ Failed to send notification:', notifError);
    }

    revalidatePath('/kol/campaigns');

    return {
      success: true,
      message: `Invitation ${response.toLowerCase()} successfully`,
      data: updatedInvitation,
    };

  } catch (error: any) {
    console.error('❌ Error in respondToCampaignInvitation:', error);
    return {
      success: false,
      error: `Failed to respond to invitation: ${error.message}`,
    };
  }
}

// TAMBAHAN: Function untuk debugging - bisa dihapus setelah testing
export async function debugInvitation(invitationId: string) {
  try {
    const invitation = await db.campaignInvitation.findUnique({
      where: { id: invitationId },
      include: {
        campaign: true,
        brand: true,
      }
    });

    console.log('Debug invitation:', invitation);
    return invitation;
  } catch (error) {
    console.error('Debug error:', error);
    return null;
  }
}

export async function getInfluencerInvitations(
  influencerId: string,
  status?: CampaignStatus
): Promise<GetInfluencerInvitationsResult> {
  try {
    if (!influencerId) {
      return {
        success: false,
        error: 'Influencer ID tidak boleh kosong.',
      };
    }

    const whereClause: any = {
      influencerId,
    };

    if (status) {
      whereClause.status = status;
    }

    const invitations = await db.campaignInvitation.findMany({
      where: whereClause,
      include: {
        campaign: true, // Include semua field campaign
        brand: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: invitations,
    };
  } catch (error: any) {
    console.error('[getInfluencerInvitations]', error);
    return {
      success: false,
      error: error.message ?? 'Failed to fetch invitations',
    };
  }
}

export async function getAllInfluencerInvitations(
  influencerId: string
): Promise<GetInfluencerInvitationsResult> {
  try {
    if (!influencerId) {
      return {
        success: false,
        error: 'Influencer ID tidak boleh kosong.',
      };
    }

    const invitations = await db.campaignInvitation.findMany({
      where: {
        influencerId,
      },
      include: {
        campaign: true,
        brand: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(
      invitations.map((i) => ({
        id: i.id,
        campaignId: i.campaignId,
        campaign: i.campaign?.name ?? 'campaign NULL',
      }))
    );

    return {
      success: true,
      data: invitations,
    };
  } catch (error: any) {
    console.error('[getAllInfluencerInvitations]', error);
    return {
      success: false,
      error: error.message ?? 'Failed to fetch invitations',
    };
  }
}

// Helper function to capture final metrics and create snapshots
async function captureAndCreateSnapshots(campaignId: string) {
  try {
    // Get campaign with active influencers
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: {
        CampaignInvitation: {
          where: { status: 'ACTIVE' },
          include: {
            influencer: {
              include: {
                platforms: {
                  include: {
                    platform: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Process each active influencer
    for (const invitation of campaign.CampaignInvitation) {
      for (const platform of invitation.influencer.platforms) {
        try {
          // 1. Create final metric record with current platform data
          const finalMetric = await db.influencerPlatformMetric.create({
            data: {
              influencerPlatformId: platform.id,
              campaignId: campaignId,
              followers: platform.followers || 0,
              following: 0, // Default value
              posts: platform.posts || 0,
              likes: platform.likesCount || 0,
              comments: platform.commentsCount || 0,
              shares: platform.sharesCount || 0,
              saves: platform.savesCount || 0,
              views: platform.views || 0,
              engagementRate: platform.engagementRate || 0,
              avgLikesPerPost: 0, // Can be calculated if needed
              avgCommentsPerPost: 0, // Can be calculated if needed
              metricType: 'CAMPAIGN_END',
              dataSource: 'SYSTEM'
            }
          });

          // 2. Get start metric (if exists)
          const startMetric = await db.influencerPlatformMetric.findFirst({
            where: {
              influencerPlatformId: platform.id,
              campaignId: campaignId,
              metricType: 'CAMPAIGN_START'
            }
          });

          // 3. Create campaign metric snapshot
          if (startMetric) {
            // Calculate growth metrics
            const growthMetrics = {
              followersGrowth: finalMetric.followers - startMetric.followers,
              followersGrowthPercent: startMetric.followers > 0 
                ? ((finalMetric.followers - startMetric.followers) / startMetric.followers) * 100 
                : 0,
              engagementGrowth: finalMetric.engagementRate - startMetric.engagementRate,
              likesGrowth: finalMetric.likes - startMetric.likes,
              commentsGrowth: finalMetric.comments - startMetric.comments,
              sharesGrowth: finalMetric.shares - startMetric.shares,
              savesGrowth: finalMetric.saves - startMetric.saves,
              viewsGrowth: (finalMetric.views || 0) - (startMetric.views || 0)
            };

            // Calculate performance score (weighted formula)
            const performanceScore = (
              (growthMetrics.followersGrowthPercent * 0.3) +
              (growthMetrics.engagementGrowth * 10 * 0.4) + // Scale engagement rate
              (Math.min(growthMetrics.likesGrowth / 100, 100) * 0.3) // Cap likes growth impact
            );

            await db.campaignMetricSnapshot.create({
              data: {
                campaignId: campaignId,
                influencerId: invitation.influencerId,
                platformId: platform.platformId,
                startMetrics: startMetric as any, // JSON field
                endMetrics: finalMetric as any, // JSON field
                growthMetrics: growthMetrics as any, // JSON field
                totalGrowthFollowers: growthMetrics.followersGrowth,
                totalGrowthEngagement: growthMetrics.engagementGrowth,
                performanceScore: performanceScore
              }
            });
          } else {
            // If no start metric exists, create snapshot with current data only
            await db.campaignMetricSnapshot.create({
              data: {
                campaignId: campaignId,
                influencerId: invitation.influencerId,
                platformId: platform.platformId,
                startMetrics: {} as any, // Empty JSON
                endMetrics: finalMetric as any, // JSON field
                growthMetrics: {} as any, // Empty JSON
                totalGrowthFollowers: 0,
                totalGrowthEngagement: 0,
                performanceScore: 0
              }
            });
          }
        } catch (error) {
          console.error(`Failed to process platform ${platform.id} for influencer ${invitation.influencerId}:`, error);
          // Continue with next platform
        }
      }
    }

    console.log(`Successfully captured metrics and created snapshots for campaign ${campaignId}`);
  } catch (error) {
    console.error(`Failed to capture and create snapshots for campaign ${campaignId}:`, error);
    throw error;
  }
}

// Function untuk mengecek dan mengupdate campaign yang sudah berakhir
export const updateExpiredCampaigns = async () => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }
    const currentDate = new Date();

    // Cari semua campaign yang sudah berakhir tapi statusnya masih ACTIVE
    const expiredCampaigns = await db.campaign.findMany({
      where: {
        endDate: {
          lt: currentDate // endDate kurang dari tanggal sekarang
        },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        endDate: true,
        brandId: true
      }
    });

    if (expiredCampaigns.length === 0) {
      return {
        success: true,
        message: "No expired campaigns found",
        updatedCount: 0
      };
    }

    // Process each expired campaign to capture final metrics
    for (const expiredCampaign of expiredCampaigns) {
      try {
        // Capture final metrics and create snapshots before updating status
        await captureAndCreateSnapshots(expiredCampaign.id);
      } catch (error) {
        console.error(`Failed to capture metrics for campaign ${expiredCampaign.id}:`, error);
        // Continue with other campaigns even if one fails
      }
    }

    // Update semua campaign yang sudah berakhir
    const updateResult = await db.campaign.updateMany({
      where: {
        id: {
          in: expiredCampaigns.map(campaign => campaign.id)
        }
      },
      data: {
        status: 'COMPLETED',
        updatedAt: new Date()
      }
    });

    // Update juga semua invitation yang terkait menjadi COMPLETE
    await db.campaignInvitation.updateMany({
      where: {
        campaignId: {
          in: expiredCampaigns.map(campaign => campaign.id)
        },
        status: 'ACTIVE'
      },
      data: {
        status: 'COMPLETED',
        updatedAt: new Date()
      }
    });

    // Optional: Kirim notifikasi ke brand bahwa campaign sudah selesai
    for (const campaign of expiredCampaigns) {
      try {
        const brand = await db.brand.findUnique({
          where: { id: campaign.brandId },
          select: { userId: true }
        });

        if (brand?.userId) {
          await createNotification({
            userId: brand.userId,
            type: 'SYSTEM',
            title: 'Campaign Completed',
            message: `Your campaign "${campaign.name}" has been completed`,
            data: {
              campaignId: campaign.id,
              completedAt: new Date().toISOString()
            }
          });
        }
      } catch (notifError) {
        console.error('Failed to send completion notification:', notifError);
      }
    }

    return {
      success: true,
      message: `Successfully updated ${updateResult.count} expired campaigns`,
      updatedCount: updateResult.count,
      updatedCampaigns: expiredCampaigns
    };

  } catch (error) {
    console.error("Error updating expired campaigns:", error);
    return {
      success: false,
      message: "Failed to update expired campaigns",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

// Function untuk mengecek campaign tertentu apakah sudah berakhir
export const checkCampaignExpiry = async (campaignId: string) => {
  try {
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        name: true,
        endDate: true,
        status: true,
        brandId: true
      }
    });

    if (!campaign) {
      return { success: false, message: "Campaign not found" };
    }

    const currentDate = new Date();
    const isExpired = campaign.endDate < currentDate;

    if (isExpired && campaign.status === 'ACTIVE') {
      // Capture final metrics before updating status
      try {
        await captureAndCreateSnapshots(campaignId);
      } catch (metricsError) {
        console.error('Failed to capture metrics for expired campaign:', metricsError);
        // Continue with campaign completion even if metrics capture fails
      }

      // Update campaign menjadi COMPLETE
      await db.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'COMPLETED',
          updatedAt: new Date()
        }
      });

      // Update invitation yang terkait
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

      // Kirim notifikasi
      try {
        const brand = await db.brand.findUnique({
          where: { id: campaign.brandId },
          select: { userId: true }
        });

        if (brand?.userId) {
          await createNotification({
            userId: campaign.brandId,
            type: 'SYSTEM',
            title: 'Campaign Completed',
            message: `Your campaign "${campaign.name}" has been completed`,
            data: {
              campaignId: campaign.id,
              completedAt: new Date().toISOString()
            }
          });
        }
      } catch (notifError) {
        console.error('Failed to send completion notification:', notifError);
      }

      return {
        success: true,
        message: "Campaign updated to COMPLETE",
        wasExpired: true,
        campaign: {
          id: campaign.id,
          name: campaign.name,
          endDate: campaign.endDate,
          newStatus: 'COMPLETE'
        }
      };
    }

    return {
      success: true,
      message: isExpired ? "Campaign already completed" : "Campaign still active",
      wasExpired: isExpired,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        endDate: campaign.endDate,
        status: campaign.status,
        isExpired
      }
    };

  } catch (error) {
    console.error("Error checking campaign expiry:", error);
    return {
      success: false,
      message: "Failed to check campaign expiry",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

// Function untuk setup cron job (jika menggunakan cron job)
export const setupCampaignExpiryCheck = async () => {
  try {
    // Cek setiap hari pada jam 00:00
    const result = await updateExpiredCampaigns();
    console.log("Campaign expiry check completed:", result);
    return result;
  } catch (error) {
    console.error("Error in campaign expiry check:", error);
    return {
      success: false,
      message: "Failed to check campaign expiry",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

// Function untuk manually trigger check dari admin panel
export const manualCampaignExpiryCheck = async () => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Cek apakah user adalah admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return { success: false, message: "Only admins can manually trigger expiry check" };
    }

    return await updateExpiredCampaigns();
  } catch (error) {
    console.error("Error in manual campaign expiry check:", error);
    return {
      success: false,
      message: "Failed to manually check campaign expiry",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

// Tambahkan fungsi ini ke dalam file campaign.actions.ts
export const updateCampaignStatus = async (campaignId: string, status: CampaignStatus) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Check if user is admin or owns the campaign
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    let campaign;

    if (user.role === 'ADMIN') {
      // Admin can update any campaign
      campaign = await db.campaign.findUnique({
        where: { id: campaignId },
        select: { id: true, brandId: true, name: true }
      });
    } else {
      // Non-admin users (Brand) can only update their own campaigns
      const brand = await db.brand.findFirst({
        where: { userId: session.user.id }
      });

      if (!brand) {
        return { success: false, message: "Brand not found" };
      }

      campaign = await db.campaign.findFirst({
        where: {
          id: campaignId,
          brandId: brand.id
        },
        select: { id: true, brandId: true, name: true }
      });
    }

    if (!campaign) {
      return { success: false, message: "Campaign not found or unauthorized" };
    }

    // Update campaign status
    const updatedCampaign = await db.campaign.update({
      where: { id: campaignId },
      data: {
        status: status,
        updatedAt: new Date()
      },
      include: {
        brands: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // If status is being set to COMPLETED, also update related invitations and capture metrics
    if (status === 'COMPLETED') {
      // Capture final metrics and create snapshots before completing
      try {
        await captureAndCreateSnapshots(campaignId);
      } catch (metricsError) {
        console.error('Failed to capture metrics when completing campaign:', metricsError);
        // Continue with completion even if metrics capture fails
      }

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

      // Send notification to brand owner
      try {
        await createNotification({
          userId: updatedCampaign.brands.userId,
          type: 'SYSTEM',
          title: 'Campaign Completed',
          message: `Your campaign "${updatedCampaign.name}" has been completed and final metrics have been captured`,
          data: {
            campaignId: updatedCampaign.id,
            completedAt: new Date().toISOString(),
            completedBy: session.user.id
          }
        });
      } catch (notifError) {
        console.error('Failed to send campaign completion notification:', notifError);
      }
    }

    // If status is being set to ACTIVE, update related invitations
    if (status === 'ACTIVE') {
      // Only update invitations that are currently PENDING
      await db.campaignInvitation.updateMany({
        where: {
          campaignId: campaignId,
          status: 'PENDING'
        },
        data: {
          status: 'ACTIVE',
          updatedAt: new Date()
        }
      });
    }

    // Revalidate the campaigns page
    revalidatePath('/campaigns');
    revalidatePath(`/campaigns/${campaignId}`);

    return {
      success: true,
      message: `Campaign status updated to ${status}`,
      campaign: updatedCampaign
    };

  } catch (error) {
    console.error("Error updating campaign status:", error);
    return {
      success: false,
      message: "Failed to update campaign status",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

// Campaign Type DIRECRT APPROVAL BY ADMIN
export const getPendingDirectCampaigns = async () => {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized', campaigns: [] }
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  if (!user || user.role !== 'ADMIN') {
    return { success: false, message: 'Only admin can access this', campaigns: [] }
  }

  try {
    const campaigns = await db.campaign.findMany({
      where: {
        type: 'DIRECT',
        status: 'PENDING',
      },
      include: {
        brands: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return {
      success: true,
      campaigns
    }
  } catch (error) {
    console.error('Error fetching pending campaigns:', error)
    return {
      success: false,
      message: 'Internal error',
      campaigns: []
    }
  }
}

// Utility function untuk error handling yang type-safe
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
};

const getErrorCode = (error: unknown): string | null => {
  if (error && typeof error === 'object' && error !== null && 'code' in error) {
    return String((error as { code: unknown }).code);
  }
  return null;
};

const isPrismaError = (error: unknown): error is { code: string; meta?: any } => {
  return (
    error !== null &&
    typeof error === 'object' && 
    'code' in error && 
    'meta' in error
  );
};

export const approveCampaignByAdmin = async (
  campaignId: string, 
  selectedInfluencerIds: string[]
) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Cek role admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return { success: false, message: "Only admin can approve campaigns" };
    }

    // Validasi selectedInfluencerIds
    if (!selectedInfluencerIds || selectedInfluencerIds.length === 0) {
      return { 
        success: false, 
        message: "Please select at least one influencer to approve the campaign" 
      };
    }

    // Ambil campaign dengan data lebih lengkap
    const campaign = await db.campaign.findFirst({
      where: {
        id: campaignId,
        type: 'DIRECT',
        status: 'PENDING'
      },
      include: {
        brands: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!campaign) {
      return { success: false, message: "Campaign not found or already approved" };
    }

    console.log('Campaign found:', { 
      id: campaign.id, 
      brandId: campaign.brandId,
      brandsUserId: campaign.brands?.userId 
    });

    // Validasi bahwa semua influencer yang dipilih ada dan tersedia
    const validInfluencers = await db.user.findMany({
      where: {
        id: { in: selectedInfluencerIds },
        role: 'INFLUENCER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        influencers: {
          select: {
            id: true
          }
        }
      }
    });

    console.log('Valid influencers found:', validInfluencers.length, 'out of', selectedInfluencerIds.length);
    console.log('Selected IDs:', selectedInfluencerIds);
    console.log('Valid IDs:', validInfluencers.map(inf => inf.id));

    if (validInfluencers.length !== selectedInfluencerIds.length) {
      const invalidIds = selectedInfluencerIds.filter(
        id => !validInfluencers.some(inf => inf.id === id)
      );
      console.log('Invalid influencer IDs:', invalidIds);
      
      return {
        success: false,
        message: `Invalid influencer IDs found: ${invalidIds.join(', ')}`
      };
    }

    // Debug: Cek struktur tabel CampaignInvitation
    const existingInvitations = await db.campaignInvitation.findMany({
      where: { campaignId },
      select: { 
        id: true, 
        campaignId: true, 
        influencerId: true, 
        status: true,
        brandId: true 
      }
    });
    
    console.log('Existing invitations:', existingInvitations);

    // Mulai database transaction dengan error handling yang lebih baik
    const result = await db.$transaction(async (tx) => {
      // 1. Ubah status campaign ke ACTIVE
      const updatedCampaign = await tx.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'ACTIVE',
          updatedAt: new Date()
        }
      });

      // 2. Hapus invitation yang sudah ada untuk campaign ini (jika ada)
      await tx.campaignInvitation.deleteMany({
        where: {
          campaignId: campaignId
        }
      });

      // 3. Buat campaign invitations baru untuk setiap influencer yang dipilih
      const campaignInvitations = [];
      
      for (const userInfluencer of validInfluencers) {
        try {
          console.log('Creating invitation for:', {
            campaignId,
            userId: userInfluencer.id,
            influencerId: userInfluencer.influencers?.id,
            brandId: campaign.brandId
          });

          if (!userInfluencer.influencers?.id) {
            throw new Error(`No influencer record found for user ${userInfluencer.id}`);
          }

          const invitation = await tx.campaignInvitation.create({
            data: {
              campaignId: campaignId,
              influencerId: userInfluencer.influencers.id, // Use the actual influencer ID
              brandId: campaign.brandId, // Pastikan brandId ada
              status: 'PENDING',
              invitedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          
          campaignInvitations.push(invitation);
        } catch (invitationError) {
          console.error(`Error creating invitation for user ${userInfluencer.id}:`, invitationError);
          const errorMessage = getErrorMessage(invitationError);
          throw new Error(`Failed to create invitation for user ${userInfluencer.id}: ${errorMessage}`);
        }
      }

      return { updatedCampaign, campaignInvitations };
    });

    // 4. Kirim notifikasi ke brand
    try {
      if (campaign.brands?.userId) {
        await createNotification({
          userId: campaign.brands.userId,
          type: 'SYSTEM',
          title: 'Campaign Disetujui',
          message: `Campaign "${campaign.name}" telah disetujui dan ${selectedInfluencerIds.length} influencer telah diundang untuk berpartisipasi.`,
          data: {
            campaignId: campaign.id,
            approvedAt: new Date().toISOString(),
            selectedInfluencersCount: selectedInfluencerIds.length
          }
        });
      }
    } catch (error) {
      console.error('Failed to send approval notification to brand:', error);
    }

    // 5. Kirim notifikasi ke setiap influencer yang dipilih
    try {
      await Promise.all(
        validInfluencers.map(influencer =>
          createNotification({
            userId: influencer.id,
            type: 'INVITATION',
            title: 'Campaign Invitation',
            message: `You have been selected for campaign "${campaign.name}" by ${campaign.brands?.name}. Please review and accept the invitation.`,
            data: {
              campaignId: campaign.id,
              campaignName: campaign.name,
              brandName: campaign.brands?.name,
              invitedAt: new Date().toISOString()
            }
          })
        )
      );
    } catch (error) {
      console.error('Failed to send invitation notifications to influencers:', error);
    }

    revalidatePath(`/campaigns/${campaignId}`);
    revalidatePath('/admin/campaigns/requests');
    
    return {
      success: true,
      message: `Campaign approved successfully with ${selectedInfluencerIds.length} influencer(s) invited`,
      campaign: result.updatedCampaign,
      invitedInfluencers: validInfluencers.length
    };

  } catch (error) {
    console.error("Error approving campaign:", error);
    
    const errorMessage = getErrorMessage(error);
    const errorCode = getErrorCode(error);
    
    // Handle specific Prisma errors
    if (isPrismaError(error)) {
      if (errorCode === 'P2003') {
        return {
          success: false,
          message: "Database constraint violation. Please check if all selected influencers exist and are valid.",
          error: errorMessage
        };
      }
      
      if (errorCode === 'P2002') {
        return {
          success: false,
          message: "Duplicate entry detected. Some invitations may already exist.",
          error: errorMessage
        };
      }
    }
    
    return {
      success: false,
      message: "Failed to approve campaign",
      error: errorMessage
    };
  }
};

// Fungsi tambahan untuk mengambil influencer yang tersedia
export const getAvailableInfluencers = async (
  campaignType?: string, 
  targetAudience?: string
) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Cek role admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return { success: false, message: "Only admin can access influencer data" };
    }

    // Query influencer berdasarkan kriteria
    const whereClause: any = {
      role: 'INFLUENCER',
      // Optional: tambahkan filter status aktif
      // status: 'ACTIVE'
    };

    // Optional: tambahkan filter berdasarkan niche jika targetAudience tersedia
    if (targetAudience) {
      whereClause.influencer = {
        niche: {
          contains: targetAudience,
          mode: 'insensitive'
        }
      };
    }

    const influencers = await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        influencers: {
          select: {
            userId: true
          }
        }
      },
    });

    // Transform data untuk frontend
    const transformedInfluencers = influencers.map(user => ({
      id: user.id,
      name: user.name || 'Unknown',
      email: user.email,
      avatar: user.image,
    }));

    return {
      success: true,
      influencers: transformedInfluencers,
      message: `Found ${transformedInfluencers.length} available influencers`
    };

  } catch (error) {
    console.error("Error fetching available influencers:", error);
    return {
      success: false,
      message: "Failed to fetch available influencers",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

export const rejectCampaignByAdmin = async (campaignId: string, reason?: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Cek role admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return { success: false, message: "Only admin can reject campaigns" };
    }

    // Ambil campaign yang bertipe Direct dan status PENDING
    const campaign = await db.campaign.findFirst({
      where: {
        id: campaignId,
        type: 'DIRECT',
        status: 'PENDING'
      },
      include: {
        brands: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!campaign) {
      return { success: false, message: "Campaign not found or already processed" };
    }

    // Ubah status campaign ke REJECTED
    const updatedCampaign = await db.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'REJECTED',
        updatedAt: new Date(),
        // Jika Anda memiliki field untuk reason rejection, tambahkan di sini
        // rejectionReason: reason
      }
    });

    // Ubah semua invitation yang masih PENDING jadi REJECTED
    await db.campaignInvitation.updateMany({
      where: {
        campaignId,
        status: 'PENDING'
      },
      data: {
        status: 'REJECTED',
        updatedAt: new Date()
      }
    });

    // Kirim notifikasi ke brand
    try {
      await createNotification({
        userId: campaign.brands.userId,
        type: 'SYSTEM',
        title: 'Campaign Ditolak',
        message: `Campaign dengan Nama "${campaign.name}" telah ditolak. ${reason ? `Reason: ${reason}` : 'Silakan hubungi tim kami untuk info lebih lanjut.'}`,
        data: {
          campaignId: campaign.id,
          rejectedAt: new Date().toISOString(),
          reason: reason || null
        }
      });
    } catch (error) {
      console.error('Failed to send rejection notification:', error);
    }

    revalidatePath(`/campaigns/${campaignId}`);
    
    return {
      success: true,
      message: "Campaign rejected successfully",
      campaign: updatedCampaign
    };
  } catch (error) {
    console.error("Error rejecting campaign:", error);
    return {
      success: false,
      message: "Failed to reject campaign",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

// Juga update fungsi getPendingDirectCampaigns untuk mengambil semua campaign (tidak hanya PENDING)
export const getAllDirectCampaigns = async () => {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized', campaigns: [] }
  }
  
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })
  
  if (!user || user.role !== 'ADMIN') {
    return { success: false, message: 'Only admin can access this', campaigns: [] }
  }
  
  try {
    const campaigns = await db.campaign.findMany({
      where: {
        type: 'DIRECT',
      },
      include: {
        brands: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return {
      success: true,
      campaigns
    }
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return {
      success: false,
      message: 'Internal error',
      campaigns: []
    }
  }
}

// ==================== Matric Campaign Tracking Data Influencer ====================
// 1. Ambil influencer dengan filtering berdasarkan status campaign
export async function getCampaignInfluencersById(
  campaignId: string,
  includeMetrics: boolean = false
) {
  try {
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      select: { status: true, endDate: true }
    });

    if (!campaign) {
      return {
        success: false,
        message: 'Campaign not found'
      };
    }

    const invitations = await db.campaignInvitation.findMany({
      where: {
        campaignId,
        status: {
        in: ['ACTIVE', 'COMPLETED'], // hanya yang sudah accepted
        //in: ['ACTIVE']
        },
      },
      include: {
        influencer: {
          include: {
            user: {
              select: {
                name: true,
                image: true
              }
            },
            platforms: {
              include: {
                platform: true,
                // Conditional metrics inclusion
                metrics: includeMetrics ? {
                  where: {
                    campaignId: campaignId,
                  },
                  orderBy: {
                    recordedAt: 'desc'
                  },
                  take: 20 // limit recent metrics
                } : false,
              },
            },
          },
        },
      },
    });

    const data = invitations.map(invitation => ({
      invitationId: invitation.id,
      influencerId: invitation.influencer.id,
      influencer: {
        id: invitation.influencer.id,
        name: invitation.influencer.user.name,
        image: invitation.influencer.user.image,
        platforms: invitation.influencer.platforms.map(platform => ({
          id: platform.id,
          username: platform.username,
          platform: {
            id: platform.platform.id,
            name: platform.platform.name,
          },
          // Map database fields to match interface expectations
          followers: platform.followers,
          posts: platform.posts,
          engagementRate: platform.engagementRate,
          // Additional fields from database
          views: platform.views,
          likesCount: platform.likesCount,
          commentsCount: platform.commentsCount,
          sharesCount: platform.sharesCount,
          savesCount: platform.savesCount,
          // Map metrics with proper typing
          metrics: platform.metrics ? platform.metrics.map(metric => ({
            id: metric.id,
            followers: metric.followers,
            likes: metric.likes,
            comments: metric.comments,
            shares: metric.shares,
            saves: metric.saves,
            views: metric.views || 0,
            engagementRate: metric.engagementRate,
            avgLikesPerPost: metric.avgLikesPerPost,
            avgCommentsPerPost: metric.avgCommentsPerPost,
            metricType: metric.metricType,
            recordedAt: metric.recordedAt.toISOString(),
            dataSource: metric.dataSource,
          })) : []
        }))
      },
      invitationStatus: invitation.status,
      invitedAt: invitation.invitedAt.toISOString(),
      respondedAt: invitation.respondedAt?.toISOString()
    }));

    return {
      success: true,
      data,
      campaign: {
        status: campaign.status,
        endDate: campaign.endDate.toISOString()
      }
    };
  } catch (error) {
    console.error('Error getting campaign influencers:', error);
    return {
      success: false,
      message: 'Failed to get influencers',
    };
  }
}

// 2. Ambil metrics untuk campaign (live atau frozen)
export async function getCampaignMetrics(campaignId: string) {
  try {
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      select: { 
        status: true, 
        endDate: true,
        startDate: true 
      }
    });

    if (!campaign) {
      return {
        success: false,
        message: 'Campaign not found'
      };
    }

    // Jika campaign sudah selesai, ambil dari snapshot
    if (campaign.status === 'COMPLETED') {
      const snapshots = await db.campaignMetricSnapshot.findMany({
        where: { campaignId },
        include: {
          campaign: {
            select: { name: true }
          }
        }
      });

      return {
        success: true,
        data: snapshots,
        dataType: 'snapshot' as const, // frozen data
        message: 'Campaign completed - showing final metrics'
      };
    }

    // Jika campaign masih aktif, ambil live metrics
    const liveMetrics = await db.influencerPlatformMetric.findMany({
      where: { 
        campaignId,
        recordedAt: {
          gte: campaign.startDate,
          lte: campaign.endDate || new Date()
        }
      },
      include: {
        influencerPlatform: {
          include: {
            influencer: { select: { id: true, userId: true } },
            platform: { select: { name: true, } }
          }
        }
      },
      orderBy: {
        recordedAt: 'desc'
      }
    });

    return {
      success: true,
      data: liveMetrics,
      dataType: 'live' as const, // real-time data
      message: 'Campaign active - showing live metrics'
    };

  } catch (error) {
    console.error('Error getting campaign metrics:', error);
    return {
      success: false,
      message: 'Failed to get campaign metrics'
    };
  }
}

// 3. Freeze metrics saat campaign berakhir
export async function finalizeCampaignMetrics(campaignId: string) {
  try {
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: {
        CampaignInvitation: {
          where: { status: 'ACTIVE' },
          include: {
            influencer: {
              include: {
                platforms: true
              }
            }
          }
        }
      }
    });

    if (!campaign) {
      return {
        success: false,
        message: 'Campaign not found'
      };
    }

    // Proses setiap influencer yang terlibat
    for (const invitation of campaign.CampaignInvitation) {
      for (const platform of invitation.influencer.platforms) {
        // Ambil metrics awal dan akhir
        const startMetric = await db.influencerPlatformMetric.findFirst({
          where: {
            influencerPlatformId: platform.id,
            campaignId: campaignId,
            metricType: 'CAMPAIGN_START'
          }
        });

        const endMetric = await db.influencerPlatformMetric.findFirst({
          where: {
            influencerPlatformId: platform.id,
            campaignId: campaignId,
            metricType: 'CAMPAIGN_END'
          },
          orderBy: { recordedAt: 'desc' }
        });

        if (startMetric && endMetric) {
          // Hitung growth metrics
          const growthMetrics = {
            followersGrowth: endMetric.followers - startMetric.followers,
            followersGrowthPercent: ((endMetric.followers - startMetric.followers) / startMetric.followers) * 100,
            engagementGrowth: endMetric.engagementRate - startMetric.engagementRate,
            likesGrowth: endMetric.likes - startMetric.likes,
            commentsGrowth: endMetric.comments - startMetric.comments,
            sharesGrowth: endMetric.shares - startMetric.shares,
            savesGrowth: endMetric.saves - startMetric.saves,
          };

          // Performance score calculation (example formula)
          const performanceScore = (
            (growthMetrics.followersGrowthPercent * 0.3) +
            (growthMetrics.engagementGrowth * 0.4) +
            (growthMetrics.likesGrowth / 100 * 0.3)
          );

          // Simpan snapshot
          await db.campaignMetricSnapshot.create({
            data: {
              campaignId: campaignId,
              influencerId: invitation.influencerId,
              platformId: platform.platformId,
              startMetrics: startMetric,
              endMetrics: endMetric,
              growthMetrics: growthMetrics,
              totalGrowthFollowers: growthMetrics.followersGrowth,
              totalGrowthEngagement: growthMetrics.engagementGrowth,
              performanceScore: performanceScore
            }
          });
        }
      }
    }

    // Update campaign status
    await db.campaign.update({
      where: { id: campaignId },
      data: { 
        status: 'COMPLETED',
        updatedAt: new Date()
      }
    });

    return {
      success: true,
      message: 'Campaign metrics finalized successfully'
    };

  } catch (error) {
    console.error('Error finalizing campaign metrics:', error);
    return {
      success: false,
      message: 'Failed to finalize campaign metrics'
    };
  }
}

// 4. Record metrics untuk influencer (hanya saat campaign aktif)
export async function recordInfluencerMetrics(
  influencerPlatformId: string,
  campaignId: string,
  metricsData: {
    followers: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    engagementRate: number;
    metricType?: MetricType;
  }
) {
  try {
    // Check if campaign is still active
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      select: { status: true, endDate: true }
    });

    if (!campaign) {
      return {
        success: false,
        message: 'Campaign not found'
      };
    }

    if (campaign.status === 'COMPLETED') {
      return {
        success: false,
        message: 'Cannot record metrics - campaign has ended'
      };
    }

    // Record the metrics
    const metric = await db.influencerPlatformMetric.create({
      data: {
        influencerPlatformId,
        campaignId,
        ...metricsData,
        metricType: metricsData.metricType || 'PERIODIC'
      }
    });

    // Update current values in InfluencerPlatform
    await db.influencerPlatform.update({
      where: { id: influencerPlatformId },
      data: {
        followers: metricsData.followers,
        engagementRate: metricsData.engagementRate,
      }
    });

    return {
      success: true,
      data: metric,
      message: 'Metrics recorded successfully'
    };

  } catch (error) {
    console.error('Error recording influencer metrics:', error);
    return {
      success: false,
      message: 'Failed to record metrics'
    };
  }
}

// 5. Update metrics untuk influencer (hanya saat campaign aktif)
export async function updateInfluencerMetrics(
  campaignId: string,
  influencerPlatformId: string,
  metricsData: {
    followers?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    views?: number;
    engagementRate?: number;
    metricType?: 'CAMPAIGN_START' | 'CAMPAIGN_END' | 'PERIODIC' | 'MANUAL';
  }
) {
  try {
    // Check campaign status
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      select: { status: true, endDate: true }
    });

    if (!campaign) {
      return {
        success: false,
        message: 'Campaign not found'
      };
    }

    if (campaign.status === 'COMPLETED') {
      return {
        success: false,
        message: 'Cannot update metrics - campaign has ended and data is locked'
      };
    }

    // Get current platform data
    const platform = await db.influencerPlatform.findUnique({
      where: { id: influencerPlatformId },
      select: { 
        followers: true, 
        engagementRate: true,
        influencer: { select: { userId: true } }
      }
    });

    if (!platform) {
      return {
        success: false,
        message: 'Influencer platform not found'
      };
    }

    // Use current values as fallback
    const finalMetricsData = {
      followers: metricsData.followers ?? platform.followers ?? 0,
      likes: metricsData.likes ?? 0,
      comments: metricsData.comments ?? 0,
      shares: metricsData.shares ?? 0,
      saves: metricsData.saves ?? 0,
      views: metricsData.views ?? 0,
      engagementRate: metricsData.engagementRate ?? platform.engagementRate ?? 0,
      metricType: metricsData.metricType ?? 'PERIODIC',
    };

    // Create new metric record
    const metric = await db.influencerPlatformMetric.create({
      data: {
        influencerPlatformId,
        campaignId,
        ...finalMetricsData,
        dataSource: 'MANUAL'
      }
    });

    // Update current platform values
    await db.influencerPlatform.update({
      where: { id: influencerPlatformId },
      data: {
        followers: finalMetricsData.followers,
        engagementRate: finalMetricsData.engagementRate,
      }
    });

    return {
      success: true,
      data: metric,
      message: 'Metrics updated successfully'
    };

  } catch (error) {
    console.error('Error updating influencer metrics:', error);
    return {
      success: false,
      message: 'Failed to update metrics'
    };
  }
}

// 6. Get detailed metrics untuk specific influencer di campaign
export async function getInfluencerCampaignMetrics(
  campaignId: string,
  influencerId: string
) {
  try {
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      select: { 
        status: true, 
        startDate: true, 
        endDate: true,
        name: true
      }
    });

    if (!campaign) {
      return {
        success: false,
        message: 'Campaign not found'
      };
    }

    // Get influencer platforms and their metrics
    const influencerPlatforms = await db.influencerPlatform.findMany({
      where: { influencerId },
      include: {
        platform: { select: { name: true } },
        metrics: {
          where: { campaignId },
          orderBy: { recordedAt: 'asc' }
        }
      }
    });

    // If campaign is completed, try to get snapshot data
    let snapshotData = null;
    if (campaign.status === 'COMPLETED') {
      snapshotData = await db.campaignMetricSnapshot.findMany({
        where: { 
          campaignId,
          influencerId 
        }
      });
    }

    const platformMetrics = influencerPlatforms.map(platform => {
      const metrics = platform.metrics || [];
      const startMetric = metrics.find(m => m.metricType === 'CAMPAIGN_START') || metrics[0];
      const endMetric = metrics.find(m => m.metricType === 'CAMPAIGN_END') || metrics[metrics.length - 1];
      const latestMetric = metrics[metrics.length - 1];

      // Calculate growth if we have start and end data
      let growth = null;
      if (startMetric && latestMetric && startMetric.id !== latestMetric.id) {
        growth = {
          followers: latestMetric.followers - startMetric.followers,
          followersPercent: startMetric.followers > 0 
            ? ((latestMetric.followers - startMetric.followers) / startMetric.followers) * 100 
            : 0,
          engagement: latestMetric.engagementRate - startMetric.engagementRate,
          likes: latestMetric.likes - startMetric.likes,
          comments: latestMetric.comments - startMetric.comments,
          shares: latestMetric.shares - startMetric.shares,
          saves: latestMetric.saves - startMetric.saves,
        };
      }

      return {
        platformId: platform.id,
        platform: platform.platform,
        username: platform.username,
        currentFollowers: platform.followers,
        currentEngagementRate: platform.engagementRate,
        metrics,
        startMetric,
        endMetric,
        latestMetric,
        growth,
        totalDataPoints: metrics.length
      };
    });

    return {
      success: true,
      data: {
        campaign: {
          id: campaignId,
          name: campaign.name,
          status: campaign.status,
          startDate: campaign.startDate,
          endDate: campaign.endDate
        },
        influencerId,
        platforms: platformMetrics,
        snapshotData,
        dataType: campaign.status === 'COMPLETED' ? 'snapshot' : 'live'
      }
    };

  } catch (error) {
    console.error('Error getting influencer campaign metrics:', error);
    return {
      success: false,
      message: 'Failed to get influencer metrics'
    };
  }
}

// 7. Start campaign tracking (record initial metrics)
export async function startCampaignTracking(campaignId: string) {
  try {
    // Get campaign with accepted influencers
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: {
        CampaignInvitation: {
          where: { status: 'ACTIVE' },
          include: {
            influencer: {
              include: {
                platforms: true
              }
            }
          }
        }
      }
    });

    if (!campaign) {
      return {
        success: false,
        message: 'Campaign not found'
      };
    }

    if (campaign.status !== 'PENDING') {
      return {
        success: false,
        message: 'Campaign tracking can only be started from PENDING status'
      };
    }

    // Record initial metrics for all accepted influencers
    const startMetrics = [];
    
    for (const invitation of campaign.CampaignInvitation) {
      for (const platform of invitation.influencer.platforms) {
        // Record start metrics
        const startMetric = await db.influencerPlatformMetric.create({
          data: {
            influencerPlatformId: platform.id,
            campaignId: campaignId,
            followers: platform.followers || 0,
            likes: 0, // Will be updated as campaign progresses
            comments: 0,
            shares: 0,
            saves: 0,
            views: 0,
            engagementRate: platform.engagementRate || 0,
            metricType: 'CAMPAIGN_START',
            dataSource: 'SYSTEM'
          }
        });
        
        startMetrics.push(startMetric);
      }
    }

    // Update campaign status to ACTIVE
    await db.campaign.update({
      where: { id: campaignId },
      data: { 
        status: 'ACTIVE',
        updatedAt: new Date()
      }
    });

    return {
      success: true,
      data: {
        campaignId,
        startMetrics,
        message: 'Campaign tracking started successfully'
      }
    };

  } catch (error) {
    console.error('Error starting campaign tracking:', error);
    return {
      success: false,
      message: 'Failed to start campaign tracking'
    };
  }
}

// 8. Get campaign performance summary
export async function getCampaignPerformanceSummary(campaignId: string) {
  try {
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true
      }
    });

    if (!campaign) {
      return {
        success: false,
        message: 'Campaign not found'
      };
    }

    // Get accepted influencers count
    const totalInfluencers = await db.campaignInvitation.count({
      where: {
        campaignId,
        status: 'ACTIVE'
      }
    });

    // Get total metrics recorded
    const totalMetrics = await db.influencerPlatformMetric.count({
      where: { campaignId }
    });

    // Get performance data
    let performanceData = null;
    
    if (campaign.status === 'COMPLETED') {
      // Get snapshot summary
      const snapshots = await db.campaignMetricSnapshot.findMany({
        where: { campaignId },
        select: {
          totalGrowthFollowers: true,
          totalGrowthEngagement: true,
          performanceScore: true
        }
      });

      if (snapshots.length > 0) {
        performanceData = {
          totalFollowersGrowth: snapshots.reduce((sum, s) => sum + s.totalGrowthFollowers, 0),
          avgEngagementGrowth: snapshots.reduce((sum, s) => sum + s.totalGrowthEngagement, 0) / snapshots.length,
          avgPerformanceScore: snapshots.reduce((sum, s) => sum + (s.performanceScore || 0), 0) / snapshots.length,
          dataType: 'final'
        };
      }
    } else {
      // Calculate live performance
      const startMetrics = await db.influencerPlatformMetric.findMany({
        where: {
          campaignId,
          metricType: 'CAMPAIGN_START'
        }
      });

      const latestMetrics = await db.influencerPlatformMetric.findMany({
        where: { campaignId },
        distinct: ['influencerPlatformId'],
        orderBy: { recordedAt: 'desc' }
      });

      if (startMetrics.length > 0 && latestMetrics.length > 0) {
        const totalStartFollowers = startMetrics.reduce((sum, m) => sum + m.followers, 0);
        const totalCurrentFollowers = latestMetrics.reduce((sum, m) => sum + m.followers, 0);
        const followersGrowth = totalCurrentFollowers - totalStartFollowers;

        const avgStartEngagement = startMetrics.reduce((sum, m) => sum + m.engagementRate, 0) / startMetrics.length;
        const avgCurrentEngagement = latestMetrics.reduce((sum, m) => sum + m.engagementRate, 0) / latestMetrics.length;

        performanceData = {
          totalFollowersGrowth: followersGrowth,
          avgEngagementGrowth: avgCurrentEngagement - avgStartEngagement,
          avgPerformanceScore: null, // Will be calculated when campaign ends
          dataType: 'live'
        };
      }
    }

    return {
      success: true,
      data: {
        campaign,
        summary: {
          totalInfluencers,
          totalMetrics,
          performance: performanceData,
          lastUpdated: new Date().toISOString()
        }
      }
    };

  } catch (error) {
    console.error('Error getting campaign performance summary:', error);
    return {
      success: false,
      message: 'Failed to get campaign summary'
    };
  }
}

// 9. Export campaign data (untuk brand yang ingin backup data)
export async function exportCampaignData(campaignId: string) {
  try {
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: {
        brands: { select: { name: true } },
        CampaignInvitation: {
          include: {
            influencer: {
              include: {
                platforms: {
                  include: {
                    platform: true,
                    metrics: {
                      where: { campaignId },
                      orderBy: { recordedAt: 'asc' }
                    }
                  }
                }
              }
            }
          }
        },
        snapshots: true
      }
    });

    if (!campaign) {
      return {
        success: false,
        message: 'Campaign not found'
      };
    }

    // Format data for export
    const exportData = {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        brand: campaign.brands.name,
        status: campaign.status,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt
      },
      influencers: campaign.CampaignInvitation.map(inv => ({
        invitationId: inv.id,
        influencerId: inv.influencer.id,
        status: inv.status,
        invitedAt: inv.invitedAt,
        respondedAt: inv.respondedAt,
        platforms: inv.influencer.platforms.map(platform => ({
          platformId: platform.id,
          platformName: platform.platform.name,
          username: platform.username,
          currentFollowers: platform.followers,
          currentEngagementRate: platform.engagementRate,
          metrics: platform.metrics.map(metric => ({
            recordedAt: metric.recordedAt,
            metricType: metric.metricType,
            followers: metric.followers,
            likes: metric.likes,
            comments: metric.comments,
            shares: metric.shares,
            saves: metric.saves,
            views: metric.views,
            engagementRate: metric.engagementRate,
            dataSource: metric.dataSource
          }))
        }))
      })),
      snapshots: campaign.snapshots.map(snapshot => ({
        influencerId: snapshot.influencerId,
        platformId: snapshot.platformId,
        startMetrics: snapshot.startMetrics,
        endMetrics: snapshot.endMetrics,
        growthMetrics: snapshot.growthMetrics,
        totalGrowthFollowers: snapshot.totalGrowthFollowers,
        totalGrowthEngagement: snapshot.totalGrowthEngagement,
        performanceScore: snapshot.performanceScore,
        createdAt: snapshot.createdAt
      })),
      exportedAt: new Date().toISOString(),
      dataType: campaign.status === 'COMPLETED' ? 'final' : 'interim'
    };

    return {
      success: true,
      data: exportData,
      message: 'Campaign data exported successfully'
    };

  } catch (error) {
    console.error('Error exporting campaign data:', error);
    return {
      success: false,
      message: 'Failed to export campaign data'
    };
  }
}

// 10. Batch update metrics (untuk update multiple influencers sekaligus)
export async function batchUpdateMetrics(
  campaignId: string,
  updates: Array<{
    influencerPlatformId: string;
    metrics: {
      followers?: number;
      likes?: number;
      comments?: number;
      shares?: number;
      saves?: number;
      views?: number;
      engagementRate?: number;
    };
  }>
) {
  try {
    // Check campaign status
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      select: { status: true }
    });

    if (!campaign) {
      return {
        success: false,
        message: 'Campaign not found'
      };
    }

    if (campaign.status === 'COMPLETED') {
      return {
        success: false,
        message: 'Cannot update metrics - campaign has ended'
      };
    }

    const results = [];
    const errors = [];

    // Process each update
    for (const update of updates) {
      try {
        const result = await updateInfluencerMetrics(
          campaignId,
          update.influencerPlatformId,
          {
            ...update.metrics,
            metricType: 'PERIODIC'
          }
        );

        if (result.success) {
          results.push(result.data);
        } else {
          errors.push({
            influencerPlatformId: update.influencerPlatformId,
            error: result.message
          });
        }
      } catch {
        errors.push({
          influencerPlatformId: update.influencerPlatformId,
          error: 'Update failed'
        });
      }
    }

    return {
      success: true,
      data: {
        successful: results,
        failed: errors,
        totalProcessed: updates.length,
        successCount: results.length,
        errorCount: errors.length
      },
      message: `Batch update completed. ${results.length} successful, ${errors.length} failed.`
    };

  } catch (error) {
    console.error('Error in batch update metrics:', error);
    return {
      success: false,
      message: 'Failed to process batch update'
    };
  }
}
