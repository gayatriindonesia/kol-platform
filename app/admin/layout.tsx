import { auth } from '@/auth'
import AdminLayoutWrapper from './AdminLayoutWrapper'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <AdminLayoutWrapper session={session}>
      {children}
    </AdminLayoutWrapper>
  )
}