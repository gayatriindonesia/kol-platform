import { getAuditLogs } from '@/lib/audit.actions'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CalendarDays } from 'lucide-react'

export default async function AuditLogPage() {
  const logs = await getAuditLogs()

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Audit Log</h1>

      {logs.length === 0 ? (
        <p className="text-gray-500">No audit logs found.</p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="border bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium text-blue-600">{log.user.name}</span>{" "}
                    <span className="text-gray-700">{log.message}</span>{" "}
                    <span className="font-medium text-pink-600">({log.target.name})</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <CalendarDays className="h-4 w-4" />
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
                <Badge variant="outline" className="mt-2 text-xs">{log.action}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
