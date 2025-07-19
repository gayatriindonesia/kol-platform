'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { LogOut, Settings, User } from 'lucide-react'
import { Session } from 'next-auth'
import { FaBell } from 'react-icons/fa' // FontAwesome Bell
import { format } from 'date-fns'

// atau
// import { HiOutlineBell } from 'react-icons/hi' // Heroicons
// import { IoMdNotificationsOutline } from 'react-icons/io' // Ionicons
// import { RiNotification3Line } from 'react-icons/ri' // Remix Icons
import { getNotifications, markNotificationAsRead } from '@/lib/notification.actions'

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
  // const notifRef = useRef<HTMLDivElement>(null)

  const { data: session } = useSession()
  const currentSession = session || initialSession

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentSession?.user?.id) return
      const res = await getNotifications(currentSession.user.id)
      if (res.success) {
        setNotifications(res.data || [])
      }
    }

    fetchNotifications()
  }, [currentSession?.user?.id])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleNotifClick = async (notifId: string) => {
    await markNotificationAsRead(notifId)
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notifId ? { ...n, isRead: true } : n
      )
    )
  }

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/signin' })
  }

  return (
    <header className="bg-white shadow h-16 fixed md:relative w-full top-0 z-10 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center ml-10 md:ml-0">
        <h2 className="text-lg font-medium">Brand Dashboard</h2>
      </div>
      <div className="flex items-center space-x-4">
        {/* Notifikasi */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 relative"
          >
            <FaBell className="text-xl" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md z-50 max-h-96 overflow-y-auto">
              <div className="p-4 border-b font-semibold text-sm text-gray-700">Notifications</div>
              {notifications.length === 0 ? (
                <div className="p-4 text-gray-500 text-sm">No notifications</div>
              ) : (
                notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotifClick(notif.id)}
                    className={`block w-full text-left px-4 py-2 text-sm ${notif.isRead ? 'bg-white' : 'bg-gray-100'
                      } hover:bg-gray-200`}
                  >
                    <div className="font-medium">{notif.title}</div>
                    <div className="text-xs text-gray-600">{notif.message}</div>
                    <div className="text-xs text-gray-400">
                      {format(new Date(notif.createdAt), 'dd MMM yyyy HH:mm')}
                    </div>
                  </button>
                ))
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
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <Link
                href="/brand/profile"
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