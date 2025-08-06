"use server";

import { CampaignFormData } from "@/types/campaign";
import { Prisma, CampaignStatus, CampaignInvitation } from "@prisma/client";
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

// ambil data influencer yang sudah diundang ke campaign
export async function getCampaignInfluencersById(campaignId: string) {
  try {
    const invitations = await db.campaignInvitation.findMany({
      where: {
        campaignId,
        status: {
          in: ['ACTIVE', 'COMPLETED'],
        },
      },
      include: {
        influencer: {
          include: {
            user: true,
            platforms: {
              include: {
                platform: true,
              },
            },
          },
        },
      },
    });

    const data = invitations.map(invitation => ({
      id: invitation.id,
      influencerId: invitation.influencer.id,
      user: invitation.influencer.user,
      platforms: invitation.influencer.platforms,
    }));
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error getting campaign influencers:', error);
    return {
      success: false,
      message: 'Failed to get influencers',
    };
  }
}

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

    // If status is being set to COMPLETED, also update related invitations
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

      // Send notification to brand owner
      try {
        await createNotification({
          userId: updatedCampaign.brands.userId,
          type: 'SYSTEM',
          title: 'Campaign Stopped',
          message: `Your campaign "${updatedCampaign.name}" has been stopped`,
          data: {
            campaignId: updatedCampaign.id,
            stoppedAt: new Date().toISOString(),
            stoppedBy: session.user.id
          }
        });
      } catch (notifError) {
        console.error('Failed to send campaign stop notification:', notifError);
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

export const approveCampaignByAdmin = async (campaignId: string) => {
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
      return { success: false, message: "Campaign not found or already approved" };
    }

    if (campaign.type === 'DIRECT' && user.role !== 'ADMIN') {
      return {
        success: false,
        message: "Only admin can approve Direct campaigns"
      };
    }


    // Ubah status campaign ke ACTIVE
    const updatedCampaign = await db.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'ACTIVE',
        updatedAt: new Date()
      }
    });

    // Optional: Ubah semua invitation yang masih PENDING jadi ACTIVE
    await db.campaignInvitation.updateMany({
      where: {
        campaignId,
        status: 'PENDING'
      },
      data: {
        status: 'ACTIVE',
        updatedAt: new Date()
      }
    });

    // Kirim notifikasi ke brand
    try {
      await createNotification({
        userId: campaign.brands.userId,
        type: 'SYSTEM',
        title: 'Campaign Disetujui',
        message: `Campaign dengan Nama "${campaign.name}" telah disetujui sekarang Campaign anda telah aktif.`,
        data: {
          campaignId: campaign.id,
          approvedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to send approval notification:', error);
    }

    revalidatePath(`/campaigns/${campaignId}`);
    return {
      success: true,
      message: "Campaign approved successfully",
      campaign: updatedCampaign
    };

  } catch (error) {
    console.error("Error approving campaign:", error);
    return {
      success: false,
      message: "Failed to approve campaign",
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
