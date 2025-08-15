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
          select: { userId: true },
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