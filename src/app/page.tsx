'use client';

import { useState, useEffect } from 'react';
import { useRawInitData, init, miniApp, backButton, closingBehavior } from '@telegram-apps/sdk-react';
import { Card, Button, Badge } from '@telegram-apps/telegram-ui';
import { AI_COMPANIONS, AICompanion } from '@/data/ai-companions';

export default function Home() {
  const [selectedCompanion, setSelectedCompanion] = useState<AICompanion | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const rawInitData = useRawInitData();

  useEffect(() => {
    try {
      init();
      if (miniApp.mountSync.isAvailable()) miniApp.mountSync();
      if (backButton.mount.isAvailable()) {
        backButton.mount();
        backButton.onClick(() => {
          if (backButton.isMounted()) backButton.hide();
          window.history.back();
        });
      }
      if (closingBehavior.mount.isAvailable()) {
        closingBehavior.mount();
        if (closingBehavior.enableConfirmation.isAvailable()) closingBehavior.enableConfirmation();
      }
    } catch (err) {
      console.error('Telegram SDK init failed:', err);
    }
    return () => {
      if (backButton.isMounted()) backButton.unmount();
    };
  }, []);

  useEffect(() => {
    const authenticateUser = async () => {
      if (!rawInitData) {
        setIsLoading(false);
        return;
      }
      try {
        localStorage.setItem('telegramInitData', rawInitData);
        const response = await fetch('/api/auth/telegram-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: rawInitData }),
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        } else {
          console.error('Authentication failed');
        }
      } catch (error) {
        console.error('Error during authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };
    authenticateUser();
  }, [rawInitData]);

  const handleCompanionSelect = (companion: AICompanion) => {
    setSelectedCompanion(companion);
    setShowChat(true);
  };

  const handleBackToHome = () => {
    setShowChat(false);
    setSelectedCompanion(null);
  };

  const energyForTier = (tier?: string) => (tier === 'FREE' ? 50 : 100);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-900 dark:to-dark-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <Card.Cell className="py-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-500 to-secondary-500 animate-pulse grid place-items-center mb-4">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h2 className="text-xl font-semibold">Preparing your experience…</h2>
              <p className="text-sm text-muted-foreground mt-1">Connecting to Telegram</p>
            </div>
          </Card.Cell>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-900 dark:to-dark-800 flex items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <Card.Cell className="p-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Emanuelle</h2>
              <p className="text-sm text-muted-foreground mt-2">Open from Telegram to continue</p>
              <div className="mt-6 w-20 h-20 rounded-2xl mx-auto bg-gradient-to-tr from-primary-500 to-secondary-500 grid place-items-center">
                <span className="text-white text-3xl">🤖</span>
              </div>
            </div>
          </Card.Cell>
        </Card>
      </div>
    );
  }

  if (showChat && selectedCompanion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-900 dark:to-dark-800">
        <div className="max-w-3xl mx-auto p-4 md:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <Button mode="plain" onClick={handleBackToHome} className="rounded-full px-3 py-2 bg-white/70 dark:bg-white/5 shadow-sm">
              ← Back
            </Button>
            <div className="text-center">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">{selectedCompanion.name}</h1>
              <p className="text-xs md:text-sm text-muted-foreground">{selectedCompanion.personality}</p>
            </div>
            <div className="shrink-0 rounded-full px-3 py-1 bg-white/70 dark:bg-white/5 shadow-sm text-sm">
              {selectedCompanion.energyCost} ⚡
            </div>
          </div>

          <Card>
            <Card.Cell className="p-0">
              <div className="p-4 md:p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 grid place-items-center text-white text-lg">
                    {selectedCompanion.avatar}
                  </div>
                  <div className="bg-white/70 dark:bg-white/5 rounded-2xl px-4 py-3">
                    <p className="text-sm">Hi {user.username || 'there'}! I'm {selectedCompanion.name}. {selectedCompanion.description}</p>
                  </div>
                </div>

                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">This is a preview. Messaging UI and premium features will appear here.</p>
                </div>

                <div className="flex gap-3">
                  <Button mode="filled" stretched className="bg-gradient-to-r from-primary-500 to-secondary-500">Start Chat</Button>
                  <Button mode="outline" onClick={handleBackToHome}>Choose Other</Button>
                </div>
              </div>
            </Card.Cell>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-900 dark:to-dark-800">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        {/* Hero header */}
        <div className="rounded-3xl bg-white/70 dark:bg-white/5 shadow-sm border border-white/20 p-5 md:p-7 mb-6">
          <div className="flex items-start md:items-center justify-between gap-4 flex-col md:flex-row">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Welcome, {user.username || 'Friend'}</h1>
              <p className="text-sm text-muted-foreground mt-1">Pick a companion and start chatting</p>
            </div>

            {/* Energy pill */}
            <div className="flex items-center gap-3 rounded-full pl-2 pr-3 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-white/10 dark:to-white/5 border border-white/20 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 grid place-items-center text-white">⚡</div>
              <div className="leading-tight">
                <div className="text-xs text-muted-foreground">Energy</div>
                <div className="text-base font-semibold">{energyForTier(user.subscription_tier)} / 100</div>
              </div>
              <div className="ml-2 text-xs rounded-full px-2 py-1 bg-white/80 dark:bg-white/10 border border-white/20">{user.subscription_tier}</div>
            </div>
          </div>
        </div>

        {/* Companions grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg md:text-xl font-semibold">AI Companions</h2>
            <Button mode="plain" className="text-xs rounded-full bg-white/70 dark:bg-white/5 px-3 py-1">View All</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_COMPANIONS.filter(c => c.subscriptionTier === user.subscription_tier || c.subscriptionTier === 'FREE').map((companion) => (
              <Card key={companion.id} className="transition-all hover:shadow-md bg-white/70 dark:bg-white/5 border border-white/20">
                <Card.Cell className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-500 to-secondary-500 grid place-items-center text-white text-2xl">
                      {companion.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold">{companion.name}</h3>
                        {companion.subscriptionTier !== 'FREE' && (
                          <Badge type="number" className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">{companion.subscriptionTier}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{companion.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">{companion.personality}</span>
                        <div className="text-sm font-medium">{companion.energyCost} ⚡</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button mode="filled" stretched className="bg-gradient-to-r from-primary-500 to-secondary-500" onClick={() => handleCompanionSelect(companion)}>
                      Chat Now
                    </Button>
                  </div>
                </Card.Cell>
              </Card>
            ))}
          </div>
        </div>

        {/* Upgrade card */}
        {user.subscription_tier === 'FREE' && (
          <div className="mt-6">
            <Card className="bg-white/70 dark:bg-white/5 border border-white/20">
              <Card.Cell className="p-5 text-center">
                <h3 className="text-lg font-semibold">Upgrade Your Experience</h3>
                <p className="text-sm text-muted-foreground mt-1">Unlock premium companions and more daily energy</p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button mode="outline">BASIC</Button>
                  <Button mode="outline">PREMIUM</Button>
                  <Button mode="outline">ULTIMATE</Button>
                </div>
              </Card.Cell>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
