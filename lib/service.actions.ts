"use server";

import { ServiceSchema } from "@/schemas";
import { db } from "./db";

type ActionResult = {
  success: boolean
  error?: string
}

export async function createService(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const description = formData.get('description') as string || undefined
    const type = formData.get('type') as string
    const isActive = formData.get('isActive') === 'true'
    const platformId = formData.get('platformId') as string
    
    // Validasi input
    const validatedFields = ServiceSchema.safeParse({
      name,
      description,
      type,
      isActive,
      platformId,
    })
    
    if (!validatedFields.success) {
      return { success: false, error: validatedFields.error.flatten().fieldErrors }
    }
    
    // Cek apakah platform dengan ID tersebut ada
    const platform = await db.platform.findUnique({
      where: { id: platformId },
    })
    
    if (!platform) {
      return { success: false, error: { platformId: ['Platform tidak ditemukan'] } }
    }
    
    // Cek apakah nama service sudah ada untuk platform tersebut
    const existingService = await db.service.findFirst({
      where: {
        platformId,
        name,
      },
    })
    
    if (existingService) {
      return { success: false, error: { name: ['Service dengan nama ini sudah ada pada platform yang dipilih'] } }
    }
    
    // Buat service baru
    const service = await db.service.create({
      data: {
        name,
        description,
        type,
        isActive,
        platformId,
      },
    })
    return { success: true, data: service }

  } catch (error) {
    console.error('Error creating service:', error)
    return { success: false, error: 'Gagal membuat service' }
  }
}

// GET ALL
export async function getAllService() {
  try {
    const services = await db.service.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        platform: true
      }
    });
    return { data: services, status: 200 }

  } catch (error) {
    console.error("Error fetching service platform", error)
    return { error: "Failed to fetch service platform", status: 500 }
  }
}

// GET Service By ID
export async function getServiceById(id: string) {
  try {
    const service = await db.service.findUnique({
      where: { id },
      include: {
        platform: true,
      },
    })

    if (!service) {
      return { success: false, error: 'Service tidak ditemukan' }
    }

    return { data: service, status: 200 }
  } catch (error) {
    console.error('Error getting service:', error)
    return { success: false, error: 'Gagal mengambil detail service' }
  }
}

export async function getServicesByPlatformId(platformId: string) {
  try {
    const services = await db.service.findMany({
      where: { platformId },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return { success: true, data: services }
  } catch (error) {
    console.error('Error getting platform services:', error)
    return { success: false, error: 'Gagal mengambil data services platform' }
  }
}

export async function updateService(id: string, formData: FormData) {
  try {
    const name = formData.get('name') as string
    const description = formData.get('description') as string || undefined
    const type = formData.get('type') as string
    const isActive = formData.get('isActive') === 'true'
    const platformId = formData.get('platformId') as string
    
    // Validasi input
    const validatedFields = ServiceSchema.safeParse({
      name,
      description,
      type,
      isActive,
      platformId,
    })
    
    if (!validatedFields.success) {
      return { success: false, error: validatedFields.error.flatten().fieldErrors }
    }
    
    // Cek apakah service dengan ID tersebut ada
    const existingService = await db.service.findUnique({
      where: { id },
    })
    
    if (!existingService) {
      return { success: false, error: { _form: ['Service tidak ditemukan'] } }
    }
    
    // Cek apakah platform dengan ID tersebut ada
    const platform = await db.platform.findUnique({
      where: { id: platformId },
    })
    
    if (!platform) {
      return { success: false, error: { platformId: ['Platform tidak ditemukan'] } }
    }
    
    // Cek apakah nama baru sudah digunakan oleh service lain pada platform yang sama
    if (name !== existingService.name || platformId !== existingService.platformId) {
      const serviceWithSameName = await db.service.findFirst({
        where: {
          platformId,
          name,
          id: { not: id }, // Exclude current service
        },
      })
      
      if (serviceWithSameName) {
        return { success: false, error: { name: ['Service dengan nama ini sudah ada pada platform yang dipilih'] } }
      }
    }
    
    // Update service
    const updatedService = await db.service.update({
      where: { id },
      data: {
        name,
        description,
        type,
        isActive,
        platformId,
      },
    })
    
    // revalidatePath('/services')
    // revalidatePath(`/services/${id}`)
    // revalidatePath(`/platforms/${platformId}`)
    
    // Jika platform berubah, revalidate path platform lama juga
    // if (platformId !== existingService.platformId) {
    //  revalidatePath(`/platforms/${existingService.platformId}`)
    // }
    
    return { success: true, data: updatedService }
  } catch (error) {
    console.error('Error updating service:', error)
    return { success: false, error: 'Gagal memperbarui service' }
  }
}

// Delete category
export async function deleteServices(id: string) {
  try {
    const service = await db.service.findUnique({
      where: { id },
    })

    if (!service) {
      return { success: false, error: 'Service tidak ditemukan' }
    }

    // const platformId = service.platformId;

    await db.service.delete({
      where: {
        id
      }
    })

    return { message: "Platform Service deleted", status: 200 }

  } catch (error) {
    console.error("Error deleting platform service:", error)
    return { error: "Failed to delete platform service", status: 500 }
  }
}

export async function toggleServiceStatus(id: string): Promise<ActionResult> {
  try {
    const service = await db.service.findUnique({ where: { id } })
    if (!service) {
      return { success: false, error: 'Service tidak ditemukan' }
    }
    await db.service.update({
      where: { id },
      data: { isActive: !service.isActive },
    })
    // Revalidate path agar data terbaru tampil
    // revalidatePath('/admin/services')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}