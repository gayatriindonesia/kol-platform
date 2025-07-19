'use client'

import React from 'react'

const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        
        {/* Loading text */}
        <div className="text-gray-600 text-sm font-medium">
          Mohon Menunggu...
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner

// Alternative spinner designs you can use:

// Simple dots animation
export const LoadingDots: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  )
}

// Pulse animation
export const LoadingPulse: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-600 rounded-full animate-pulse mb-4"></div>
        <div className="text-gray-600 text-sm font-medium">
          Mohon Menunggu...
        </div>
      </div>
    </div>
  )
}

export const LoadingDefault: React.FC = () => {
  return (
    <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
  )
}