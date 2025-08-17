"use server";

import { auth } from "@/auth";
import { db } from "./db";
import { redirect } from "next/navigation";

type UpdateInfluencerPayload = {
  userid?: string
  categories?: string[];
  platforms?: Array<{  // Update type definition
    platformId: string;
    username: string;
  }>;
}

// Get All
export async function getAllInfluencer() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized", status: 401 };
    }

    const userRole = session.user.role; // misal 'ADMIN' | 'INFLUENCER' | lainnya

    // Hanya admin, influencer, brand yang boleh mengakses
    if (userRole !== 'ADMIN' && userRole !== 'INFLUENCER' && userRole !== 'BRAND') {
      return { error: "Forbidden", status: 403 };
    }

    // Filter:
    // - ADMIN & BRAND: bisa lihat semua influencer
    // - INFLUENCER: hanya bisa lihat milik sendiri
    const baseFilter = (userRole === 'ADMIN' || userRole === 'BRAND')
      ? {}
      : { userId: session.user.id };

    // Tambahkan constraint role influencer pada relasi user
    const influencers = await db.influencer.findMany({
      where: {
        ...baseFilter,
        user: {
          role: 'INFLUENCER',
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        platforms: {
          include: {
            platform: true
          }
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = influencers.map((influencer) => ({
      ...influencer,
      categories: influencer.categories.map((c) => c.category),
      //platforms: influencer.platforms.map((p) => p.platform) // no all attributes
      platforms: influencer.platforms.map((p) => ({
        ...p.platform,
        username: p.username,
        followers: p.followers,
        posts: p.posts,
        engagementRate: p.engagementRate,

        // Ambil Image Platform
        platformData: influencer.platforms.map((p) => {
          let parsedData = null;
          try {
            if (p.platformData) {
              parsedData = typeof p.platformData === 'string' ?
                JSON.parse(p.platformData) :
                p.platformData;
            }
          } catch (err) {
            console.error("Error parsing platformData:", err);
          }

          return {
            ...p.platform,
            username: p.username,
            followers: p.followers,
            posts: p.posts,
            engagementRate: p.engagementRate,
            avatarUrl: parsedData?.avatarUrl || null,
            thumbnailUrl: parsedData?.thumbnailUrl || null
          };
        })
      }))
    }));

    return { data: formatted, status: 200 };
  } catch (error) {
    console.error("Error fetching influencers:", error);
    return { error: "Failed to fetch influencers", status: 500 };
  }
}

// Get Influencer by ID
export async function getInfluencerById(id: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized", status: 401 };
    }

    const userRole = session.user.role;

    if (userRole !== 'ADMIN') {
      if (userRole === 'INFLUENCER') {
        const influencer = await db.influencer.findUnique({
          where: { id },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                
              }
            }
          }
        });

        if (influencer?.userId !== session.user.id) {
          return { error: "Forbidden", status: 403 };
        }
      }

      if (userRole === 'BRAND') {
        const hasAccess = await db.campaignInvitation.findFirst({
          where: {
            influencerId: id,
            campaign: {
              brands: {
                userId: session.user.id,
              },
            },
          },
        });

        if (!hasAccess) {
          return { error: "Forbidden", status: 403 };
        }
      }
    }

    const influencer = await db.influencer.findUnique({
      where: { id },
      include: {
        user: true,
        categories: {
          include: {
            category: true
          }
        },
        platforms: true
      }
    });

    if (!influencer) {
      return { error: "Influencer not found", status: 404 };
    }

    return { data: influencer, status: 200 };
  } catch (error) {
    console.error("Error fetching influencer:", error);
    return { error: "Failed to fetch influencer", status: 500 };
  }
}


// Update Influencer
export async function updateInfluencer(id: string, data: UpdateInfluencerPayload) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized", status: 401 };
    }

    // Verifikasi kepemilikan
    const existingInfluencer = await db.influencer.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingInfluencer) {
      return { error: "Influencer not found", status: 404 };
    }

    // Opsional: Periksa apakah pengguna memiliki izin
    // if (existingBrand.userId !== session.user.id) {
    //   return { error: "Not authorized to update this brand", status: 403 };
    // }

    // Check authorization - only owner or admin can update
    const userRole = session.user.role;
    if (userRole !== 'ADMIN' && existingInfluencer.userId !== session.user.id) {
      return { error: "Not authorized to update this influencer", status: 403 };
    }

    // Extract categories & influencer from the payload
    const { categories, platforms } = data;

    // const { categories, platforms, influencerData } = data;

    //const updatedInfluencer = await db.influencer.update({
    //  where: { id },
    //  data: influencerData
    // });

    // Update categories if provided
    if (categories) {
      // First delete all existing category relationships
      await db.influencerCategory.deleteMany({
        where: { influencerId: id }
      });

      // Then create new relationships
      if (categories.length > 0) {
        await Promise.all(categories.map(categoryId =>
          db.influencerCategory.create({
            data: {
              influencerId: id,
              categoryId
            }
          })
        ));
      }
    }
    // Update platforms if provided
    if (platforms) {
      // First delete all existing platform relationships
      await db.influencerPlatform.deleteMany({
        where: { influencerId: id }
      });

      // Then create new relationships
      if (platforms.length > 0) {
        await Promise.all(platforms.map(platform =>
          db.influencerPlatform.create({
            data: {
              influencerId: id,
              platformId: platform.platformId,
              username: platform.username
            }
          })
        ));
      }
    }

    const completeInfluencer = await db.influencer.findUnique({
      where: { id },
      include: {
        user: true,
        categories: {
          include: {
            category: true
          }
        },
        platforms: {
          include: {
            platform: true
          }
        }
      }
    });

    // revalidatePath("/brands");

    return { data: completeInfluencer, status: 200 };
  } catch (error) {
    console.error("Error updating influencer:", error);
    return { error: "Failed to update influencer", status: 500 };
  }
}

// Delete Brand
export async function deleteInfluencer(id: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized", status: 401 };
    }

    // Verifikasi kepemilikan (opsional)
    const existingInfluencer = await db.influencer.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingInfluencer) {
      return { error: "Influencer not found", status: 404 };
    }

    // Opsional: Periksa apakah pengguna memiliki izin
    // if (existingBrand.userId !== session.user.id) {
    //   return { error: "Not authorized to delete this brand", status: 403 };
    // }

    await db.influencer.delete({
      where: { id },
    });

    // revalidatePath("/brands");

    return { status: 200 };
  } catch (error) {
    console.error("Error deleting influencer:", error);
    return { error: "Failed to delete influencer", status: 500 };
  }
}

// KOL Dashboard Platform
export async function getCurrentInfluencer() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const influencer = await db.influencer.findUnique({
    where: { userId: session.user.id },
    include: {
      platforms: {
        include: { platform: true }
      }
    }
  });

  if (!influencer) {
    redirect("/kol");
  }

  return influencer;
}

// Function to get influencer platform data
export const getInfluencerPlatformData = async (influencerId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Get influencer with platforms and their metrics
    const influencer = await db.influencer.findUnique({
      where: { id: influencerId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            emailVerified: true
          }
        },
        platforms: {
          include: {
            platform: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    });

    if (!influencer) {
      return { success: false, message: "Influencer not found" };
    }

    return {
      success: true,
      data: {
        user: influencer.user,
        platforms: influencer.platforms,
        categories: influencer.categories
      }
    };

  } catch (error) {
    console.error("Error fetching influencer platform data:", error);
    return {
      success: false,
      message: "Failed to fetch platform data",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

// Function to get influencer active campaigns
export const getInfluencerActiveCampaigns = async (influencerId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Get active campaign invitations for this influencer
    const activeCampaigns = await db.campaignInvitation.findMany({
      where: {
        influencerId: influencerId,
        status: {
          in: ['ACTIVE', 'COMPLETED']
        }
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            goal: true,
            status: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true
          }
        },
        brand: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true,
                emailVerified: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      success: true,
      data: activeCampaigns
    };

  } catch (error) {
    console.error("Error fetching influencer campaigns:", error);
    return {
      success: false,
      message: "Failed to fetch campaigns",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

// Function to get campaign metrics for influencer
export const getInfluencerCampaignMetrics = async (influencerId: string, campaignId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Get metrics for specific campaign and influencer
    const metrics = await db.influencerPlatformMetric.findMany({
      where: {
        campaignId: campaignId,
        influencerPlatform: {
          influencerId: influencerId
        }
      },
      include: {
        influencerPlatform: {
          include: {
            platform: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      },
      orderBy: {
        recordedAt: 'desc'
      },
      take: 10 // Get last 10 metrics for each platform
    });

    return {
      success: true,
      data: metrics
    };

  } catch (error) {
    console.error("Error fetching campaign metrics:", error);
    return {
      success: false,
      message: "Failed to fetch metrics",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

// Function untuk mendapatkan growth metrics
export const getInfluencerGrowthMetrics = async (influencerId: string, campaignId?: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const whereClause: any = {
      influencerPlatform: { influencerId }
    };

    if (campaignId) {
      whereClause.campaignId = campaignId;
    }

    // Get metrics untuk growth calculation
    const metrics = await db.influencerPlatformMetric.findMany({
      where: whereClause,
      include: {
        influencerPlatform: {
          include: {
            platform: { select: { name: true } }
          }
        }
      },
      orderBy: { recordedAt: 'asc' }
    });

    // Group by platform and calculate growth
    const growthByPlatform = metrics.reduce((acc, metric) => {
      const platformName = metric.influencerPlatform.platform.name;
      
      if (!acc[platformName]) {
        acc[platformName] = [];
      }
      
      acc[platformName].push(metric);
      
      return acc;
    }, {} as Record<string, any[]>);

    const growthStats = Object.entries(growthByPlatform).map(([platformName, platformMetrics]) => {
      if (platformMetrics.length < 2) {
        return {
          platform: platformName,
          growth: null,
          message: 'Insufficient data for growth calculation'
        };
      }

      const firstMetric = platformMetrics[0];
      const lastMetric = platformMetrics[platformMetrics.length - 1];

      const followerGrowth = lastMetric.followers - firstMetric.followers;
      const followerGrowthPercent = firstMetric.followers > 0 
        ? ((lastMetric.followers - firstMetric.followers) / firstMetric.followers) * 100 
        : 0;

      return {
        platform: platformName,
        growth: {
          followers: followerGrowth,
          followersPercent: followerGrowthPercent,
          likes: lastMetric.likes - firstMetric.likes,
          comments: lastMetric.comments - firstMetric.comments,
          engagement: lastMetric.engagementRate - firstMetric.engagementRate,
          period: {
            start: firstMetric.recordedAt,
            end: lastMetric.recordedAt
          }
        }
      };
    });

    return {
      success: true,
      data: growthStats
    };

  } catch (error) {
    console.error("Error fetching growth metrics:", error);
    return {
      success: false,
      message: "Failed to fetch growth metrics",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

// Function untuk update action getInfluencerById yang sudah ada
export const getInfluencerByIdEnhanced = async (id: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { 
        success: false, 
        message: "Unauthorized",
        error: "Authentication required",
        status: 401
      };
    }

    // Get user by ID (since the ID passed is actually userId, not influencerId)
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        influencers: {
          include: {
            platforms: {
              include: {
                platform: {
                  select: {
                    id: true,
                    name: true,
                  }
                }
              }
            },
            categories: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    description: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user || !user.influencers) {
      return {
        success: false,
        message: "Influencer not found",
        error: "User is not an influencer or doesn't exist",
        status: 404
      };
    }

    const influencerData = user.influencers;

    // Get active campaigns for this influencer
    const activeCampaigns = await db.campaignInvitation.findMany({
      where: {
        influencerId: influencerData.id,
        status: {
          in: ['ACTIVE', 'COMPLETED', 'PENDING']
        }
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            goal: true,
            status: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true
          }
        },
        brand: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Limit to recent campaigns
    });

    // Calculate stats
    const totalFollowers = influencerData.platforms.reduce((sum, platform) => sum + (platform.followers || 0), 0);
    const averageEngagement = influencerData.platforms.length > 0 
      ? influencerData.platforms.reduce((sum, platform) => sum + (platform.engagementRate || 0), 0) / influencerData.platforms.length
      : 0;

    return {
      success: true,
      data: {
        user: user,
        influencer: influencerData,
        platforms: influencerData.platforms,
        categories: influencerData.categories,
        activeCampaigns: activeCampaigns,
        stats: {
          totalFollowers,
          averageEngagement,
          totalPlatforms: influencerData.platforms.length,
          activeCampaignsCount: activeCampaigns.filter(c => c.campaign.status === 'ACTIVE').length,
          totalCampaigns: activeCampaigns.length
        }
      },
      status: 200
    };

  } catch (error) {
    console.error("Error fetching enhanced influencer data:", error);
    return {
      success: false,
      message: "Failed to fetch influencer data",
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500
    };
  }
};

// Function untuk menambahkan influencer ke favorites (jika diperlukan)
{/**
export const addInfluencerToFavorites = async (influencerId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Check if already in favorites
    const existingFavorite = await db.favoriteInfluencer?.findFirst({
      where: {
        userId: session.user.id,
        influencerId: influencerId
      }
    });

    if (existingFavorite) {
      return { 
        success: false, 
        message: "Influencer already in favorites" 
      };
    }

    // Add to favorites (assuming you have a FavoriteInfluencer model)
    const favorite = await db.favoriteInfluencer?.create({
      data: {
        userId: session.user.id,
        influencerId: influencerId
      }
    });

    return {
      success: true,
      message: "Influencer added to favorites",
      data: favorite
    };

  } catch (error) {
    console.error("Error adding to favorites:", error);
    return {
      success: false,
      message: "Failed to add to favorites",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};
 */}

// Function untuk mengirim pesan ke influencer (placeholder)
{/**
export const sendMessageToInfluencer = async (influencerId: string, message: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Placeholder untuk messaging system
    // Ini bisa diimplementasikan sesuai dengan sistem messaging yang ada
    
    return {
      success: true,
      message: "Message sending feature will be implemented"
    };

  } catch (error) {
    console.error("Error sending message:", error);
    return {
      success: false,
      message: "Failed to send message",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};
 */}

// Function untuk mendapatkan top performing platforms
export const getInfluencerTopPlatforms = async (influencerId: string, limit: number = 5) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const platforms = await db.influencerPlatform.findMany({
      where: { influencerId },
      include: {
        platform: {
          select: {
            name: true,
          }
        }
      },
      orderBy: [
        { followers: 'desc' },
        { engagementRate: 'desc' }
      ],
      take: limit
    });

    return {
      success: true,
      data: platforms
    };

  } catch (error) {
    console.error("Error fetching top platforms:", error);
    return {
      success: false,
      message: "Failed to fetch top platforms",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

// Function untuk mendapatkan campaign performance summary
export const getCampaignPerformanceSummary = async (influencerId: string, campaignId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Get campaign basic info
    const campaignInvitation = await db.campaignInvitation.findFirst({
      where: {
        influencerId,
        campaignId
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            endDate: true
          }
        }
      }
    });

    if (!campaignInvitation) {
      return { 
        success: false, 
        message: "Campaign invitation not found" 
      };
    }

    // Get metrics for this campaign
    const metrics = await db.influencerPlatformMetric.findMany({
      where: {
        campaignId,
        influencerPlatform: {
          influencerId
        }
      },
      include: {
        influencerPlatform: {
          include: {
            platform: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { recordedAt: 'asc' }
    });

    // Calculate performance summary
    const platformSummary = metrics.reduce((acc, metric) => {
      const platformName = metric.influencerPlatform.platform.name;
      
      if (!acc[platformName]) {
        acc[platformName] = {
          metrics: [],
          firstMetric: metric,
          latestMetric: metric
        };
      }
      
      acc[platformName].metrics.push(metric);
      acc[platformName].latestMetric = metric;
      
      return acc;
    }, {} as Record<string, any>);

    const performanceData = Object.entries(platformSummary).map(([platform, data]) => {
      const { firstMetric, latestMetric, metrics } = data;
      
      return {
        platform,
        totalMetrics: metrics.length,
        growth: {
          followers: latestMetric.followers - firstMetric.followers,
          likes: latestMetric.likes - firstMetric.likes,
          comments: latestMetric.comments - firstMetric.comments,
          engagement: latestMetric.engagementRate - firstMetric.engagementRate
        },
        current: {
          followers: latestMetric.followers,
          engagement: latestMetric.engagementRate,
          likes: latestMetric.likes,
          comments: latestMetric.comments
        }
      };
    });

    return {
      success: true,
      data: {
        campaign: campaignInvitation.campaign,
        invitation: campaignInvitation,
        performance: performanceData,
        totalPlatforms: Object.keys(platformSummary).length,
        totalMetrics: metrics.length
      }
    };

  } catch (error) {
    console.error("Error fetching campaign performance summary:", error);
    return {
      success: false,
      message: "Failed to fetch performance summary",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};