'use client';

import React from 'react';
import { Button, Avatar, Text, Card } from '@telegram-apps/telegram-ui';
import { useAppContext } from '@/contexts/AppContext';

export function UserProfile() {
  const { user, isLoading } = useAppContext();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      console.log('Logout clicked');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Avatar 
          size={48}
          src={`https://t.me/${user.username}`}
          fallbackName={user.username || `User ${user.telegram_id}`}
        />
        <div className="flex-1 min-w-0">
          <Text weight="600" className="truncate">
            {user.username || `User ${user.telegram_id}`}
          </Text>
          <Text size="sm" color="secondary">
            {user.subscription_tier} Plan
          </Text>
          {user.subscription_expires && (
            <Text size="xs" color="secondary">
              Expires: {new Date(user.subscription_expires).toLocaleDateString()}
            </Text>
          )}
        </div>
      </div>

      {user.settings && (
        <div className="space-y-2">
          <Text size="sm" weight="500">Settings</Text>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <Text size="xs" color="secondary">Tone:</Text>
              <Text size="sm">{user.settings.tone}</Text>
            </div>
            <div>
              <Text size="xs" color="secondary">Language:</Text>
              <Text size="sm">{user.settings.language}</Text>
            </div>
            <div>
              <Text size="xs" color="secondary">Theme:</Text>
              <Text size="sm">{user.settings.theme}</Text>
            </div>
            <div>
              <Text size="xs" color="secondary">NSFW:</Text>
              <Text size="sm">{user.settings.nsfw_enabled ? 'Enabled' : 'Disabled'}</Text>
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={handleLogout}
        disabled={isLoading}
        mode="secondary"
        size="m"
        className="w-full"
      >
        {isLoading ? 'Logging out...' : 'Logout'}
      </Button>
    </Card>
  );
}



