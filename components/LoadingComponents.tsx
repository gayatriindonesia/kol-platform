// components/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'gray' | 'green' | 'red';
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'blue', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    green: 'border-green-600',
    red: 'border-red-600'
  };

  return (
    <div 
      className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    />
  );
}

// components/PageLoading.tsx
interface PageLoadingProps {
  message?: string;
  title?: string;
}

export function PageLoading({ 
  message = "Loading...", 
  title 
}: PageLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        {title && (
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        )}
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// components/AuthLoading.tsx
export function AuthLoading() {
  return (
    <PageLoading 
      title="Authenticating"
      message="Verifying your credentials..."
    />
  );
}

// components/RedirectLoading.tsx
interface RedirectLoadingProps {
  role?: string;
}

export function RedirectLoading({ role }: RedirectLoadingProps) {
  const getMessage = () => {
    if (role) {
      return `Redirecting to ${role.toLowerCase()} dashboard...`;
    }
    return "Redirecting to your dashboard...";
  };

  return (
    <PageLoading 
      title="Redirecting"
      message={getMessage()}
    />
  );
}

// components/FormLoading.tsx
interface FormLoadingProps {
  message?: string;
}

export function FormLoading({ message = "Processing..." }: FormLoadingProps) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center space-y-3">
        <LoadingSpinner />
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}