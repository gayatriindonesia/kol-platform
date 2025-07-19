"use server";

import { revalidatePath } from "next/cache";
import { db } from "./db";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

type UpdateCategoryPayload = {
  name?: string
  description?: string
}

// Create Category
export async function createCategory(name: string, description: string) {
  try {
    const newCategory = await db.category.create({
      data: {
        name,
        description,
      },
    });
    return newCategory;
  } catch (error) {
    console.error("Error creating category:", error);
    throw new Error("Failed to create category");
  }
}

// GET ALL
export async function getAllCategories() {
  try {
    const categories = await db.category.findMany()

    return { data: categories, status: 200 }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { error: 'Failed to fetch categories', status: 500 }
  }
}

// Update category
export async function updateCategory(id: string, data: UpdateCategoryPayload) {
  try {
    const updated = await db.category.update({
      where: { id },
      data
    })

    return { data: updated, status: 200 }
  } catch (error) {
    console.error("Error updating category:", error)
    return { error: "Failed to update category", status: 500 }
  }
}

// Delete category
export async function deleteCategory(id: string) {
  try {
    await db.category.delete({
      where: { id },
    })

    return { message: "Category deleted", status: 200 }
  } catch (error) {
    console.error("Error deleting category:", error)
    return { error: "Failed to delete category", status: 500 }
  }
}

// Get detail category by ID
export async function getCategoryById(id: string) {
  try {
    const category = await db.category.findUnique({
      where: { id },
    })

    if (!category) {
      return { error: "Category not found", status: 404 }
    }

    return { data: category, status: 200 }
  } catch (error) {
    console.error("Error getting category:", error)
    return { error: "Failed to get category", status: 500 }
  }
}


/*** Get Category With Influncer */
export async function getInfluencerWithCategories() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/signin')
  }

  try {
    const influencer = await db.influencer.findUnique({
      where: { userId: session.user.id },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    })

    return influencer
  } catch (error) {
    console.error('Error fetching influencer with categories:', error)
    return null
  }
}

// Add category to influencer
export async function addInfluencerCategory(categoryId: string) {
  const session = await auth()
  
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    const influencer = await db.influencer.findUnique({
      where: { userId: session.user.id }
    })

    if (!influencer) {
      return { error: 'Influencer not found' }
    }

    // Check if category already exists
    const existingConnection = await db.influencerCategory.findFirst({
      where: {
        influencerId: influencer.id,
        categoryId: categoryId
      }
    })

    if (existingConnection) {
      return { error: 'Category already added' }
    }

    await db.influencerCategory.create({
      data: {
        influencerId: influencer.id,
        categoryId: categoryId
      }
    })

    revalidatePath('/kol/platform')
    return { success: true }
  } catch (error) {
    console.error('Error adding category:', error)
    return { error: 'Failed to add category' }
  }
}

// Remove category from influencer
export async function removeInfluencerCategory(categoryId: string) {
  const session = await auth()
  
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    const influencer = await db.influencer.findUnique({
      where: { userId: session.user.id }
    })

    if (!influencer) {
      return { error: 'Influencer not found' }
    }

    await db.influencerCategory.deleteMany({
      where: {
        influencerId: influencer.id,
        categoryId: categoryId
      }
    })

    revalidatePath('/kol/platform')
    return { success: true }
  } catch (error) {
    console.error('Error removing category:', error)
    return { error: 'Failed to remove category' }
  }
}

// Update multiple categories at once
export async function updateInfluencerCategories(categoryIds: string[]) {
  const session = await auth()
  
  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  try {
    const influencer = await db.influencer.findUnique({
      where: { userId: session.user.id }
    })

    if (!influencer) {
      return { error: 'Influencer not found' }
    }

    // Remove all existing categories
    await db.influencerCategory.deleteMany({
      where: { influencerId: influencer.id }
    })

    // Add new categories
    if (categoryIds.length > 0) {
      await db.influencerCategory.createMany({
        data: categoryIds.map(categoryId => ({
          influencerId: influencer.id,
          categoryId: categoryId
        }))
      })
    }

    revalidatePath('/kol/platform')
    return { success: true }
  } catch (error) {
    console.error('Error updating categories:', error)
    return { error: 'Failed to update categories' }
  }
}