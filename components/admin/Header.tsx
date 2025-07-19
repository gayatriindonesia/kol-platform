'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { LogOut, Settings, User } from 'lucide-react'
import { Session } from 'next-auth'
import { FaBell } from 'react-icons/fa'
import { getNotifications } from '@/lib/notification.actions'

interface HeaderProps {
  session: Session | null
}

interface Notification {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: Date
}

export default function Header({ session: initialSession }: HeaderProps) {
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const { data: session } = useSession()
  const currentSession = session || initialSession

  useEffect(() => {
    const fetchNotifications = async () => {
      if (currentSession?.user?.id) {
        const res = await getNotifications(currentSession.user.id)
        if (res.success) {
          if (res.success && Array.isArray(res.data)) {
            setNotifications(res.data)
          } else {
            setNotifications([])
          }

        }
      }
    }

    fetchNotifications()
  }, [currentSession?.user?.id])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target as Node)
      ) {
        setIsNotifOpen(false)
      }
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/signin' })
  }

  return (
    <header className="bg-white shadow h-16 fixed md:relative w-full top-0 z-10 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center ml-10 md:ml-0">
        <h2 className="text-lg font-medium">Admin Dashboard</h2>
      </div>

      <div className="flex items-center">
        {/* Notifikasi */}
        <div className="relative" ref={notifRef}>
          <button
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 mr-2 md:mr-4 relative"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Notifications"
          >
            <FaBell className="text-xl" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
              <div className="px-4 py-2 border-b font-semibold text-sm">Notifications</div>
              {notifications.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">No notifications</div>
              ) : (
                <ul>
                  {notifications.map((notif) => (
                    <li key={notif.id} className="px-4 py-2 hover:bg-gray-100 text-sm">
                      <div className="font-medium">{notif.title}</div>
                      <div className="text-gray-600">{notif.message}</div>
                      <div className="text-xs text-gray-400">{new Date(notif.createdAt).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center focus:outline-none group"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <Image
                src={currentSession?.user?.image || "/images/avataruser.png"}
                alt={currentSession?.user?.name || "Profile"}
                className="h-8 w-8 rounded-full"
                width={500}
                height={500}
              />
            </div>
            {/**
            <span className="ml-2 hidden md:inline">
              {currentSession?.user?.name || "User"}
            </span>
             */}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <Link
                href="/admin/profile"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <User size={18} />
                <span className="ml-2">Your Profile</span>
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <Settings size={18} />
                <span className="ml-2">Settings</span>
              </Link>
              <div className="border-t border-gray-200"></div>
              <button
                onClick={handleSignOut}
                className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <LogOut size={18} />
                <span className="ml-2">Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
