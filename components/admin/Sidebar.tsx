'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Session } from 'next-auth'
import { adminNavigationItems } from '@/constants/navigation'

interface SidebarProps {
  isMobile: boolean
  session: Session | null
}

export default function Sidebar({ isMobile, session: initialSession }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(true)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const currentSession = session || initialSession

  useEffect(() => {
    setIsOpen(!isMobile)
  }, [isMobile])

  const toggleSidebar = () => setIsOpen(!isOpen)

  const truncateText = (text: string | undefined, maxLength: number) => {
    if (!text) return ''
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
  }

  const handleDropdownToggle = (name: string) => {
    setOpenDropdown(prev => (prev === name ? null : name))
  }

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
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      )}

      {/* Mobile Overlay */}
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
          overflow-y-auto
        `}
      >
        {/* Logo */}
        <div className="p-4">
          <Link href="/admin" className="flex items-center">
            <Image src="/images/logo.png" alt="Logo" className="h-8 w-8 mr-2" width={50} height={50} />
            <span className="text-xl font-bold">Gayatri Digital</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="px-4 py-2">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
              <Image
                src={currentSession?.user?.image || '/images/avataruser.png'}
                alt={currentSession?.user?.name || 'User'}
                className="h-10 w-10 rounded-full"
                width={500}
                height={500}
              />
            </div>
            <div>
              <div className="font-medium">
                {truncateText(currentSession?.user?.name || 'Brand User', 15)}
              </div>
              <div className="text-sm text-gray-400">{currentSession?.user?.email || ''}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6">
          <div className="px-4 py-2 text-xs text-gray-400">MENU</div>
          <nav>
            <ul>
              {adminNavigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.path
                const hasChildren = !!item.children?.length
                const isDropdownOpen = openDropdown === item.name

                return (
                  <li key={item.name} className="px-4 py-2">
                    {hasChildren ? (
                      <>
                        <button
                          className={`flex items-center w-full ${
                            isDropdownOpen ? 'bg-blue-700' : ''
                          } text-left hover:bg-gray-700 text-gray-300 hover:text-white rounded-md px-4 py-2`}
                          onClick={() => handleDropdownToggle(item.name)}
                        >
                          <Icon size={18} className="mr-3" />
                          <span className="flex-1">{item.name}</span>
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              isDropdownOpen ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isDropdownOpen && (
                          <ul className="ml-6 mt-2 space-y-1">
                            {item.children?.map((sub) => {
                              const SubIcon = sub.icon
                              return (
                                <li key={sub.path}>
                                  <Link
                                    href={sub.path!}
                                    className={`flex items-center text-sm ${
                                      pathname === sub.path
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    } rounded-md px-4 py-2`}
                                    onClick={() => isMobile && setIsOpen(false)}
                                  >
                                    <SubIcon size={16} className="mr-2" />
                                    {sub.name}
                                  </Link>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </>
                    ) : item.path ? (
                      <Link
                        href={item.path}
                        className={`flex items-center ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                        } rounded-md px-4 py-2 transition-colors duration-200`}
                        onClick={() => isMobile && setIsOpen(false)}
                      >
                        <Icon size={18} className="mr-3" />
                        {item.name}
                      </Link>
                    ) : (
                      <div
                        className="flex items-center text-gray-300 rounded-md px-4 py-2 cursor-default"
                      >
                        <Icon size={18} className="mr-3" />
                        {item.name}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>

        {/* Logout Button (optional) */}
        {/*
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