// lib/notification.actions.ts

'use server'

import { db } from '@/lib/db'

interface CreateNotificationProps {
  userId: string
  // role: string
  title: string
  type: 'ROLE_UPDATE' | 'INVITATION' | 'CAMPAIGN_APPROVAL' | 'CAMPAIGN_REJECTION' | 'SYSTEM'
  message: string
  data?: Record<string, any>  // misalnya: { redirectUrl: "/campaign/abc123" }
}

export async function createNotification({
  userId,
  title,
  type,
  message,
  data,
}: CreateNotificationProps) {
  try {
    await db.notification.create({
      data: {
        userId,
        title,
        type,
        message,
        data,
      },
    })

    // Revalidate jika notifikasi ditampilkan di halaman dashboard misalnya
    // revalidatePath('/dashboard/notifications')

    return { success: true }
  } catch (error) {
    console.error('Failed to create notification:', error)
    return { error: 'Failed to create notification' }
  }
}

export async function getNotifications(userId: string) {
  try {
    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }, // terbaru duluan
    })

    return { success: true, data: notifications }
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return { success: false, error: 'Unable to fetch notifications' }
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    await db.notification.update({
      where: { id },
      data: { isRead: true },
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    return { success: false, error: 'Unable to mark notification as read' }
  }
}

export async function markAllAsRead(userId: string) {
  try {
    await db.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
    return { success: false, error: 'Unable to mark all notifications as read' }
  }
}
