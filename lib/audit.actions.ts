import { db } from '@/lib/db'

export async function getAuditLogs() {
  return await db.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      target: true,
    },
  })
}
