import { auth } from '@/auth'
import BrandLayoutWrapper from './BrandLayoutWrapper'

export default async function BrandLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <BrandLayoutWrapper session={session}>
      {children}
    </BrandLayoutWrapper>
  )
}