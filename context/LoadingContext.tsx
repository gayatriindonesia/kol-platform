// contexts/LoadingContext.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'

interface LoadingContextType {
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
}

interface LoadingProviderProps {
  children: ReactNode
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useParams();

  // Function to start loading
  const startLoading = useCallback(() =>setIsLoading(true), [])
  
  // Function to stop loading
  const stopLoading = useCallback(() =>setIsLoading(false), [])

  // Auto stop loading after navigation
  useEffect(() => {
    const originalPush = router.push
    router.push = (...args: Parameters<typeof router.push>) => {
      startLoading()
      return originalPush.apply(router, args)
    }
    return () => {
      router.push = originalPush
    }
  }, [router, startLoading])

  // Hentikan loading ketika pathname atau searchParams berubah (setelah navigasi)
  useEffect(() => {
    stopLoading()
  }, [pathname, searchParams, stopLoading])

  const contextValue: LoadingContextType = {
    isLoading,
    startLoading,
    stopLoading
  }

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  )
}