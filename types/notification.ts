export type Notification = {
  id: string
  title: string
  message: string
  type: 'ROLE_UPDATE' | 'INVITATION' | 'CAMPAIGN_APPROVAL' | 'CAMPAIGN_REJECTION' | 'SYSTEM'
  data?: Record<string, any>
  isRead: boolean
  createdAt: string
}
