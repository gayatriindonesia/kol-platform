'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { brandNavigationItems } from '@/constants/navigation'
import Image from 'next/image'
import { Session } from 'next-auth'

interface SidebarProps {
  isMobile: boolean
  session: Session | null
}

export default function Sidebar({ isMobile, session: initialSession }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)
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


  // const handleSignOut = async () => {
  //  await signOut({ redirect: true, callbackUrl: '/signin' })
  // }

  return (
    <>
      {/* Mobile Hamburger Button */}
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
        className={
          `
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          fixed md:relative md:translate-x-0 z-20
          w-64 h-full bg-gray-800 text-white transition-transform duration-300 ease-in-out
          overflow-y-auto
        `}
      >
        <div className="p-4">
          <Link href="/admin" className="flex items-center">
            <Image src="/images/logo.png" alt="Logo" className="h-8 w-8 mr-2" width={50} height={50} />
            <span className="text-xl font-bold">Gayatri Digital</span>
          </Link>
        </div>

        <div className="px-4 py-2">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
              {currentSession?.user?.image ? (
                <Image
                  src={currentSession.user.image}
                  alt={currentSession.user.name || "User"}
                  className="h-10 w-10 rounded-full"
                  width={500}
                  height={500}
                />
              ) : (
                <Image
                  src="/images/avataruser.png"
                  alt='profile'
                  className="h-8 w-8 rounded-full"
                  width={500}
                  height={500}
                />
              )}
            </div>
            <div>
              <div className="font-medium">
                {truncateText(currentSession?.user?.name || "Brand User", 15)}
              </div>
              <div className="text-sm text-gray-400">{currentSession?.user?.email || ""}</div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="px-4 py-2 text-xs text-gray-400">MENU</div>
          <nav>
            <ul>
              {brandNavigationItems.map((item) => {
                const Icon = item.icon   // assign komponen ke variabel
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

        {/** disable button logout
        <div className="absolute bottom-0 w-full p-4">
          <button 
            onClick={handleSignOut}
            className="flex items-center text-gray-300 hover:text-white w-full"
          >
            <span className="mr-3">🚪</span>
            Sign out
          </button>
        </div>
         */}
      </aside>
    </>
  )
}