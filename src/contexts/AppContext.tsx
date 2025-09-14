'use client';
import { useSignal, initData } from '@telegram-apps/sdk-react';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Users, Session } from '@prisma/client';

interface AppContextType {
  user: Users | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authenticateUser: () => Promise<void>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
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

  // ✅ FIX: Remove logError dependency to prevent recreation
  const logError = useCallback((message: string) => {
    console.error(message);
    setError(message);
  }, []); // Empty dependency array

  // ✅ FIX: Stable checkAuthStatus function
  const checkAuthStatus = useCallback(async () => {
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
      // ✅ FIX: Direct console.error instead of logError to prevent dependency issues
      console.error('Error checking auth status');
      setError('Error checking auth status');
    }
  }, []); // Empty dependency array - this function is now stable

  const authenticateUser = useCallback(async () => {
    // ✅ FIX: Add guard to prevent multiple simultaneous calls
    if (isLoading || loginAttemptedRef.current) return;
    
    try {
      if (!initDataStateRaw) {
        logError('Telegram raw data is undefined.');
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
      logError(e instanceof Error ? e.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }, [initDataStateRaw, logError, isLoading]); // Added isLoading to dependencies

  // ✅ FIX: Stable refreshSession function
  const refreshSession = useCallback(async () => {
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
  }, []); // Empty dependency array

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      setUser(null);
      setSession(null);
      // ✅ FIX: Reset login attempt flag on logout
      loginAttemptedRef.current = false;
    }
  }, []);

  // Auto-refresh session 5 minutes before expiry
  useEffect(() => {
    if (!session) return;
    const expiresAt = new Date(session.expires_at).getTime();
    const refreshTime = Math.max(expiresAt - Date.now() - 5 * 60 * 1000, 0);
    
    // ✅ FIX: Don't set timer if refresh time is too short or negative
    if (refreshTime <= 0) return;
    
    const timer = setTimeout(refreshSession, refreshTime);
    return () => clearTimeout(timer);
  }, [session, refreshSession]);

  // ✅ FIX: Initial boot - stable dependencies
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initialize = async () => {
      setIsLoading(true);
      await checkAuthStatus();
      setIsLoading(false);
    };

    initialize();
  }, [checkAuthStatus]); // Now checkAuthStatus is stable

  // ✅ FIX: Better authentication trigger logic
  useEffect(() => {
    // Only attempt login once, and only after initial check is complete
    if (!initializedRef.current || isLoading || isAuthenticated || loginAttemptedRef.current) {
      return;
    }
    
    if (initDataStateRaw) {
      loginAttemptedRef.current = true;
      authenticateUser();
    }
  }, [isLoading, isAuthenticated, initDataStateRaw, authenticateUser]);

  const value: AppContextType = {
    user,
    session,
    isLoading,
    isAuthenticated,
    authenticateUser,
    refreshSession,
    logout,
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

