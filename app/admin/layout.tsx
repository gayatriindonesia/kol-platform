'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession } from "next-auth/react"
import Sidebar from '@/components/admin/Sidebar'
import Header from '@/components/admin/Header'
// import Footer from '@/components/admin/footer'
import '@/app/globals.css'
import { LoadingPulse } from '@/components/LoadingSpinner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobile, setIsMobile] = useState(false)
  const { data: session, status, update } = useSession()

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef(Date.now())

  // Handle screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Alternatif 1: Refresh hanya saat user activity + interval yang lebih panjang
  useEffect(() => {
    if (!session) return

    const updateLastActivity = () => {
      lastActivityRef.current = Date.now()
    }

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, updateLastActivity, { passive: true })
    })

    // Refresh session hanya jika user aktif dalam 5 menit terakhir
    const scheduleRefresh = () => {
      const now = Date.now()
      const timeSinceActivity = now - lastActivityRef.current
      const fiveMinutes = 5 * 60 * 1000

      // Hanya refresh jika user aktif dalam 5 menit terakhir
      if (timeSinceActivity < fiveMinutes) {
        update()
      }

      // Schedule next check dalam 10 menit (bukan 1 menit)
      refreshTimeoutRef.current = setTimeout(scheduleRefresh, 10 * 60 * 1000)
    }

    // Start the refresh cycle
    refreshTimeoutRef.current = setTimeout(scheduleRefresh, 10 * 60 * 1000)

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateLastActivity)
      })
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [session, update])

  // Alternatif 2: Refresh saat window focus (user kembali ke tab)
  useEffect(() => {
    if (!session) return

    const handleFocus = () => {
      // Refresh session saat user kembali ke tab
      const now = Date.now()
      const lastUpdate = localStorage.getItem('lastSessionUpdate')
      const fiveMinutes = 5 * 60 * 1000

      if (!lastUpdate || (now - parseInt(lastUpdate)) > fiveMinutes) {
        update()
        localStorage.setItem('lastSessionUpdate', now.toString())
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [session, update])

  // Tampilkan loading state saat memeriksa sesi
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingPulse />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isMobile={isMobile} session={session} />

      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header session={session} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">
          {children}
        </main>
      </div>
    </div>
  )
}