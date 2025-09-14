'use client';

import React from 'react';
import { Card, Button, Text, Avatar } from '@telegram-apps/telegram-ui';
import { useAuth } from '@/contexts/AppContext';

export function ProfilePage() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <Text>Loading profile...</Text>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <Text>Please log in to view your profile</Text>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar 
            size={64}
            src={`https://t.me/${user.username}`}
            fallbackName={user.username || `User ${user.telegram_id}`}
          />
          <div>
            <Text weight="600" size="xl">
              {user.username || `User ${user.telegram_id}`}
            </Text>
            <Text size="sm" color="secondary">
              Telegram ID: {user.telegram_id}
            </Text>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Text size="sm" color="secondary">Subscription</Text>
            <Text weight="500">{user.subscription_tier}</Text>
          </div>
          {user.subscription_expires && (
            <div>
              <Text size="sm" color="secondary">Expires</Text>
              <Text weight="500">
                {new Date(user.subscription_expires).toLocaleDateString()}
              </Text>
            </div>
          )}
        </div>

        {user.settings && (
          <div className="mb-6">
            <Text weight="600" className="mb-3 block">Settings</Text>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text size="sm" color="secondary">Tone</Text>
                <Text>{user.settings.tone}</Text>
              </div>
              <div>
                <Text size="sm" color="secondary">Language</Text>
                <Text>{user.settings.language}</Text>
              </div>
              <div>
                <Text size="sm" color="secondary">Theme</Text>
                <Text>{user.settings.theme}</Text>
              </div>
              <div>
                <Text size="sm" color="secondary">NSFW Content</Text>
                <Text>{user.settings.nsfw_enabled ? 'Enabled' : 'Disabled'}</Text>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={logout}
          disabled={isLoading}
          mode="secondary"
          size="l"
          className="w-full"
        >
          {isLoading ? 'Logging out...' : 'Logout'}
        </Button>
      </Card>
    </div>
  );
}



