import { db } from '@/lib/db'

export async function getAuditLogs() {
  return await db.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      User_AuditLog_userIdToUser: true,
      User_AuditLog_targetIdToUser: true,
    },
  })
}
