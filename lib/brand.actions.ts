"use server";

import { auth } from "@/auth";
import { db } from "./db"

type UpdateBrandPayload = {
  name?: string
  userid?: string
}

// Get All
export async function getAllBrand() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { error: "Unauthorized", status: 401 };
    }

    // If user is admin, fetch all brands
    const isAdmin = session.user.role === 'ADMIN';

    const brands = await db.brand.findMany({
      where: isAdmin
        ? {}
        : { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { user: true }
    });

    return { data: brands, status: 200 };
  } catch (error) {
    console.error("Error fetching brands:", error);
    return { error: "Failed to fetch brands", status: 500 };
  }
}

// Create Brand
export async function createBrand(name: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { error: "Unauthorized", status: 401 };
    }

    const brand = await db.brand.create({
      data: {
        name,
        userId: session.user.id,
      },
    });

    // revalidatePath("/brands"); // Revalidasi path untuk memperbarui data di UI
    
    return { data: brand, status: 201 };
  } catch (error) {
    console.error("Error creating brand:", error);
    return { error: "Failed to create brand", status: 500 };
  }
}

// GET BY ID
export const getBrandById = async (brandId: string) => {
  try {
    const brand = await db.brand.findUnique({
      where: { id: brandId },
      select: { name: true }
    });
    
    return brand 
      ? { success: true, brand }
      : { success: false, message: "Brand tidak ditemukan" };
  } catch (error) {
    return { success: false, message: "Gagal memuat brand", error };
  }
};

export async function updateBrand(id: string, data: UpdateBrandPayload) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { error: "Unauthorized", status: 401 };
    }

    // Verifikasi kepemilikan (opsional)
    const existingBrand = await db.brand.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingBrand) {
      return { error: "Brand not found", status: 404 };
    }

    // Opsional: Periksa apakah pengguna memiliki izin
    // if (existingBrand.userId !== session.user.id) {
    //   return { error: "Not authorized to update this brand", status: 403 };
    // }

    const updatedBrand = await db.brand.update({
      where: { id },
      data
    });

    // revalidatePath("/brands");
    
    return { data: updatedBrand, status: 200 };
  } catch (error) {
    console.error("Error updating brand:", error);
    return { error: "Failed to update brand", status: 500 };
  }
}

// Delete Brand
export async function deleteBrand(id: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { error: "Unauthorized", status: 401 };
    }

    // Verifikasi kepemilikan (opsional)
    const existingBrand = await db.brand.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingBrand) {
      return { error: "Brand not found", status: 404 };
    }

    // Opsional: Periksa apakah pengguna memiliki izin
    // if (existingBrand.userId !== session.user.id) {
    //   return { error: "Not authorized to delete this brand", status: 403 };
    // }

    await db.brand.delete({
      where: { id },
    });

    // revalidatePath("/brands");
    
    return { status: 200 };
  } catch (error) {
    console.error("Error deleting brand:", error);
    return { error: "Failed to delete brand", status: 500 };
  }
}