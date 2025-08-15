import { auth } from '@/auth'
import KolLayoutWrapper from './KolLayoutWrapper'

export default async function BrandLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <KolLayoutWrapper session={session}>
      {children}
    </KolLayoutWrapper>
  )
}