"use server";

import { db } from "./db";

type UpdatePlatformPayload = {
    name?: string
  }

// Create Platform
export async function createPlatform(name: string) {
    try {
        const newPlatform = await db.platform.create({
            data: {
                name
            },
        });
        return newPlatform;

    } catch (error) {
        console.error("Error creating platform:",error);
        throw new Error("Failed to create platform");
    }
}

// GET ALL
export async function getAllPlatform() {
    try {
        const platforms = await db.platform.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                services: true,
            },
        })

        return { data: platforms, status: 200, success: true, }
    } catch (error) {
        console.error("Error fetching platform", error)
        return { error: "Failed to fetch platform", status: 500}
    }
}

// Update category
export async function updatePlatform(id: string, data: UpdatePlatformPayload) {
  try {
    const updated = await db.platform.update({
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
export async function deletePlatform(id: string) {
  try {
    await db.platform.delete({
      where: { id },
    })

    return { message: "Platform deleted", status: 200 }
  } catch (error) {
    console.error("Error deleting platform:", error)
    return { error: "Failed to delete platform", status: 500 }
  }
}