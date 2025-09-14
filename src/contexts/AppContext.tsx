'use client';
import { useSignal, initData } from '@telegram-apps/sdk-react';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { Users, Session } from '@prisma/client';

interface AppContextType {
  user: Users | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authenticateUser: () => Promise<void>;
  refreshSession: () => Promise<void>;

}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Users | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loginAttemptedRef = useRef(false);
  const initializedRef = useRef(false);

  const initDataStateRaw = useSignal(initData.raw);
  const isAuthenticated = !!user && !!session;

  // Simple functions - no useCallback needed for internal functions
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user ?? null);
        setSession(data.session ?? null);
      } else {
        setUser(null);
        setSession(null);
      }
    } catch {
      setUser(null);
      setSession(null);
      console.error('Error checking auth status');
      setError('Error checking auth status');
    }
  };

  const authenticateUser = async () => {
    if (isLoading || loginAttemptedRef.current) return;
    
    try {
      if (!initDataStateRaw) {
        console.error('Telegram raw data is undefined.');
        setError('Telegram raw data is undefined.');
        return;
      }
      
      setIsLoading(true);
      const res = await fetch('/api/auth/telegram-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ initData: initDataStateRaw }),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Login failed');
      }
      
      const data = await res.json();
      setUser(data.user);
      setSession(data.session);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Authentication failed';
      console.error(message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user ?? null);
        setSession(data.session ?? null);
      } else {
        setUser(null);
        setSession(null);
      }
    } catch {
      setUser(null);
      setSession(null);
    }
  };

  // Auto-refresh session 5 minutes before expiry
  useEffect(() => {
    if (!session) return;
    
    const expiresAt = new Date(session.expires_at).getTime();
    const refreshTime = Math.max(expiresAt - Date.now() - 5 * 60 * 1000, 0);
    
    if (refreshTime <= 0) return;
    
    const timer = setTimeout(refreshSession, refreshTime);
    return () => clearTimeout(timer);
  }, [session?.expires_at]); // Only depend on the specific value that matters

  // Initial auth check - only run once
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initialize = async () => {
      setIsLoading(true);
      await checkAuthStatus();
      setIsLoading(false);
    };

    initialize();
  }, []); // Empty deps - run once

  // Auto-login if not authenticated and have telegram data
  useEffect(() => {
   
    if (isLoading || isAuthenticated || loginAttemptedRef.current || !initDataStateRaw) {
      return;
    }
    
    loginAttemptedRef.current = true;
    authenticateUser();
  }, [isLoading, isAuthenticated, initDataStateRaw]); // Simple deps

  const value: AppContextType = {
    user,
    session,
    isLoading,
    isAuthenticated,
    authenticateUser,
    refreshSession,
  };

  if (error) return <div>{error}</div>;

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
