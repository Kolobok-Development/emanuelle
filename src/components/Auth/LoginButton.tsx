'use client';

import React, { useState } from 'react';
import { Button, ButtonProps } from '@telegram-apps/telegram-ui';
import { useAuth } from '@/contexts/AppContext';

interface LoginButtonProps extends Omit<ButtonProps, 'onClick'> {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function LoginButton({ 
  children = 'Login with Telegram!!!', 
  onSuccess, 
  onError, 
  ...buttonProps 
}: LoginButtonProps) {
  const { authenticateUser, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    console.log('Login button clicked');
    try {
      setError(null);
      await authenticateUser();
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        {...buttonProps}
        onClick={handleLogin}
        disabled={isLoading}
        size="l"
        mode="primary"
      >
        {isLoading ? 'Logging in...' : children}
      </Button>
      
      {error && (
        <div className="text-red-500 text-sm text-center max-w-xs">
          {error}
        </div>
      )}
    </div>
  );
}

