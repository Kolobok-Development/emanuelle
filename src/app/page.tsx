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
    // Initialize Telegram SDK
    try {
      init();
      
      if (miniApp.mountSync.isAvailable()) {
        miniApp.mountSync();
      }
      
      if (backButton.mount.isAvailable()) {
        backButton.mount();
        backButton.onClick(() => {
          if (backButton.isMounted()) {
            backButton.hide();
          }
          window.history.back();
        });
      }
      
      if (closingBehavior.mount.isAvailable()) {
        closingBehavior.mount();
        if (closingBehavior.enableConfirmation.isAvailable()) {
          closingBehavior.enableConfirmation();
        }
      }
    } catch (err) {
      console.error('Telegram SDK init failed:', err);
    }

    return () => {
      if (backButton.isMounted()) {
        backButton.unmount();
      }
    };
  }, []);

  useEffect(() => {
    const authenticateUser = async () => {
      console.log('start authenticateUser');
      if (rawInitData) {
        console.log(rawInitData);
        try {
          // Store initData in localStorage for backend verification
          localStorage.setItem('telegramInitData', rawInitData);

          console.log('rawInitData', rawInitData);
          
          // Send initData to backend for verification and user creation
          const response = await fetch('/api/auth/telegram-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ initData: rawInitData }),
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user);
            console.log('User authenticated:', userData.user);
          } else {
            console.error('Authentication failed');
          }
        } catch (error) {
          console.error('Error during authentication:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-900 dark:to-dark-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <Card.Cell className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center animate-pulse">
              <span className="text-white text-2xl">🤖</span>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Initializing...
            </h2>
            <p className="text-muted-foreground">
              Setting up your AI companion
            </p>
          </Card.Cell>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-900 dark:to-dark-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <Card.Cell className="text-center py-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
              Welcome to Emanuelle
            </h2>
            <p className="text-muted-foreground mb-4">
              Your AI chat companion
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Please open this app from Telegram to continue
            </p>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
              <span className="text-white text-2xl">🤖</span>
            </div>
            <p className="text-xs text-muted-foreground">
              If you're already in Telegram, try refreshing the page
            </p>
          </Card.Cell>
        </Card>
      </div>
    );
  }

  if (showChat && selectedCompanion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-900 dark:to-dark-800">
        <div className="container mx-auto p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              mode="outline" 
              onClick={handleBackToHome}
              className="flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back</span>
            </Button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                {selectedCompanion.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedCompanion.personality}
              </p>
            </div>

            <div className="text-right">
              <div className="text-sm text-muted-foreground">Energy Cost</div>
              <div className="text-lg font-semibold text-primary-600">
                {selectedCompanion.energyCost} ⚡
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="max-w-2xl mx-auto">
            <Card>
              <Card.Cell className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">{selectedCompanion.avatar}</span>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 flex-1">
                      <p className="text-sm">Hello {user.username || 'there'}! I'm {selectedCompanion.name}. {selectedCompanion.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      This is a demo chat interface. In the full app, you would be able to:
                    </p>
                    <ul className="text-left space-y-2 text-sm text-muted-foreground">
                      <li>• Send messages and get AI responses</li>
                      <li>• Use energy points for conversations</li>
                      <li>• Save chat history and preferences</li>
                      <li>• Access premium features with subscription</li>
                    </ul>
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      mode="filled" 
                      stretched
                      className="bg-gradient-to-r from-primary-500 to-secondary-500"
                      onClick={() => alert(`This would start a real chat with ${selectedCompanion.name}!`)}
                    >
                      Start Chat
                    </Button>
                    <Button 
                      mode="outline"
                      onClick={handleBackToHome}
                    >
                      Choose Different Companion
                    </Button>
                  </div>
                </div>
              </Card.Cell>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Main Home Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-900 dark:to-dark-800">
      <div className="container mx-auto p-4">
        {/* Header with User Info and Energy */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
              Welcome back, {user.username || 'User'}!
            </h1>
            <p className="text-muted-foreground">
              Choose your AI companion and start chatting
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">Available Energy</div>
            <div className="text-3xl font-bold text-primary-600">
              {user.subscription_tier === 'FREE' ? '50' : '100'} ⚡
            </div>
            <div className="text-xs text-muted-foreground">
              {user.subscription_tier === 'FREE' ? 'Free tier' : `${user.subscription_tier} plan`}
            </div>
          </div>
        </div>

        {/* AI Companions Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Choose Your AI Companion</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_COMPANIONS.filter(c => c.subscriptionTier === user.subscription_tier || c.subscriptionTier === 'FREE').map((companion) => (
              <Card 
                key={companion.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleCompanionSelect(companion)}
              >
                <Card.Cell className="p-4">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                      <span className="text-white text-2xl">{companion.avatar}</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{companion.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {companion.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">
                        {companion.personality}
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium text-primary-600">
                          {companion.energyCost}
                        </span>
                        <span className="text-xs text-muted-foreground">⚡</span>
                      </div>
                    </div>

                    {companion.subscriptionTier !== 'FREE' && (
                      <Badge 
                        type="number"
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white mb-3"
                      >
                        {companion.subscriptionTier}
                      </Badge>
                    )}

                    <Button 
                      mode="filled" 
                      stretched 
                      className="mt-3 bg-gradient-to-r from-primary-500 to-secondary-500 p-2"
                    >
                      Chat Now
                    </Button>
                  </div>
                </Card.Cell>
              </Card>
            ))}
          </div>
        </div>

        {/* Subscription Info */}
        {user.subscription_tier === 'FREE' && (
          <Card className="max-w-md mx-auto">
            <Card.Cell className="text-center py-6">
              <h3 className="text-lg font-semibold mb-2">Upgrade Your Experience</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get access to premium AI companions and more energy points
              </p>
              <Button 
                mode="filled"
                stretched
                className="bg-gradient-to-r from-primary-500 to-secondary-500"
                onClick={() => alert('This would open the subscription upgrade page!')}
              >
                View Plans
              </Button>
            </Card.Cell>
          </Card>
        )}
      </div>
    </div>
  );
}
