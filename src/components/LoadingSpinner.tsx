'use client';

import { Card } from '@telegram-apps/telegram-ui';

export const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-900 dark:to-dark-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <Card.Cell className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center animate-pulse">
            <span className="text-white text-2xl">🤖</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Loading...
          </h2>
          <p className="text-muted-foreground">
            Initializing your AI companion
          </p>
        </Card.Cell>
      </Card>
    </div>
  );
};
