'use client'

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider
      refetchInterval={5 * 60} // Refresh session setiap 5 menit
      refetchOnWindowFocus={true} // Refresh saat window/tab difokuskan
    >
      {children}
    </NextAuthSessionProvider>
  )
}