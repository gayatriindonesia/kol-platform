'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession } from "next-auth/react"
import Sidebar from '@/components/admin/Sidebar'
import Header from '@/components/admin/Header'
import { LoadingPulse } from '@/components/LoadingSpinner'
import { Session } from 'next-auth'

interface Props {
  children: React.ReactNode
  session: Session | null
}

export default function AdminLayoutWrapper({ children, session: serverSession }: Props) {
  const [isMobile, setIsMobile] = useState(false)
  const { data: clientSession, status, update } = useSession()
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef(Date.now())

  // Prioritize client session, fallback to server session
  const session = clientSession || serverSession

  // Handle screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Session refresh logic with better error handling
  useEffect(() => {
    if (!session || !update) return

    const updateLastActivity = () => {
      lastActivityRef.current = Date.now()
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, updateLastActivity, { passive: true })
    })

    const scheduleRefresh = () => {
      const now = Date.now()
      const timeSinceActivity = now - lastActivityRef.current
      const fiveMinutes = 5 * 60 * 1000

      if (timeSinceActivity < fiveMinutes) {
        update().catch(error => {
          console.error('Session update failed:', error)
        })
      }

      refreshTimeoutRef.current = setTimeout(scheduleRefresh, 10 * 60 * 1000)
    }

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

  // Window focus refresh
  useEffect(() => {
    if (!session || !update) return

    const handleFocus = () => {
      try {
        const now = Date.now()
        const lastUpdate = localStorage.getItem('lastSessionUpdate')
        const fiveMinutes = 5 * 60 * 1000

        if (!lastUpdate || (now - parseInt(lastUpdate)) > fiveMinutes) {
          update().catch(console.error)
          localStorage.setItem('lastSessionUpdate', now.toString())
        }
      } catch (error) {
        console.error('Focus refresh failed:', error)
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [session, update])

  // Loading states
  if (status === "loading" && !serverSession) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <LoadingPulse />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <LoadingPulse />
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
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