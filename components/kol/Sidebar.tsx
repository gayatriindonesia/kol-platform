'use client'

import { Session } from "next-auth"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { kolNavigationItems } from '@/constants/navigation'
import Image from 'next/image'
import { useSession } from "next-auth/react"

interface SidebarProps {
  isMobile: boolean
  session: Session | null
}

const Sidebar = ({ isMobile, session: initialSession }: SidebarProps) => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  // Gunakan session dari hook jika tersedia, jika tidak gunakan initialSession
  const currentSession = session || initialSession

  // Handle responsive layout
  useEffect(() => {
    // On desktop, sidebar should always be open
    if (!isMobile) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [isMobile])

  const toggleSidebar = () => setIsOpen(!isOpen)

  const truncateText = (text: string | undefined, maxLength: number) => {
    if (!text) return ''
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
  }

  return (
    <>
      {/* Mobile Hamburger Button - Only show on mobile */}
      {isMobile && (
        <button
          className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-gray-800 text-white"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      )}

      {/* Overlay untuk mobile ketika sidebar terbuka */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          fixed md:relative md:translate-x-0 z-20
          w-64 h-full bg-gray-800 text-white transition-transform duration-300 ease-in-out
        `}
      >
        <div className="p-4">
          <Link href="/kol" className="flex items-center">
            <Image 
              src="/images/logo.png" 
              alt="Logo" 
              width={32} 
              height={32} 
              className="h-8 w-8 mr-2" 
            />
            <span className="text-xl font-bold">Gayatri Digital</span>
          </Link>
        </div>

        <div className="px-4 py-2">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center mr-3 overflow-hidden">
              {currentSession?.user?.image ? (
                <Image
                  src={currentSession.user.image}
                  alt={currentSession.user.name || "User"}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <Image
                  src="/images/avataruser.png"
                  alt='profile'
                  width={40}
                  height={40}
                  className="object-cover"
                />
              )}
            </div>
            <div>
              <div className="font-medium">
                {truncateText(currentSession?.user?.name || "KOL User", 15)}
              </div>
              <div className="text-sm text-gray-400">{currentSession?.user?.email || ""}</div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="px-4 py-2 text-xs text-gray-400">MENU</div>
          <nav>
            <ul>
              {kolNavigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.path} className="px-4 py-2">
                    <Link
                      href={item.path}
                      className={`flex items-center ${pathname === item.path ? 'bg-blue-600 text-white rounded-md px-4 py-2' : 'text-gray-300 hover:text-white hover:bg-gray-700 rounded-md px-4 py-2'
                        } transition-colors duration-200`}
                      onClick={() => isMobile && setIsOpen(false)}
                    >
                      <Icon size={18} className="mr-3" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}

export default Sidebar