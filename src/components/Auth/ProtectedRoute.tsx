'use client';

import React from 'react';
import { useAuth } from '@/contexts/AppContext';
import { LoginButton } from './LoginButton';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  fallback,
  requireAuth = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6 p-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please log in with your Telegram account to continue
          </p>
        </div>
        <LoginButton />
      </div>
    );
  }

  if (!requireAuth && isAuthenticated) {
    // User is authenticated but route doesn't require auth
    // You might want to redirect them or show different content
    return <>{children}</>;
  }

  return <>{children}</>;
}



