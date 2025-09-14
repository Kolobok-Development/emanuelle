'use client';

import { useAppContext } from '@/contexts/AppContext';
import { AI_COMPANIONS, type AICompanion } from '@/data/ai-companions';
import { 
  Card, 
  Button, 
  Badge, 
  Text, 
  Title, 
  Headline, 
  Spinner,
  List
} from '@telegram-apps/telegram-ui';
import Image from 'next/image';

export default function Home() {
  const { user, isLoading, isAuthenticated, authenticateUser } = useAppContext();

  // Mock energy balance - in real app this would come from user data
  const energyBalance = 150;

  const handleCompanionSelect = (companion: AICompanion) => {
    // TODO: Navigate to chat with selected companion
    console.log('Selected companion:', companion);
  };

  // AI Girl images - you can replace these with actual AI girl images
  const aiGirlImages = {
    emanuelle: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face',
    sophia: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face',
    luna: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face',
    atlas: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face',
    nova: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=600&fit=crop&crop=face',
    zen: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900">
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <Spinner size="m" />
        </div>
      ) : isAuthenticated && user ? (
        <div className="space-y-0">
          {/* Header with Night Sky Background */}
          <div className="relative bg-gradient-to-b from-black via-gray-900 to-gray-800 min-h-[200px] overflow-hidden">
            {/* Stars */}
            <div className="absolute inset-0">
              <div className="absolute top-4 left-8 w-1 h-1 bg-white rounded-full opacity-80 animate-pulse"></div>
              <div className="absolute top-12 left-16 w-1 h-1 bg-white rounded-full opacity-60"></div>
              <div className="absolute top-8 left-32 w-1 h-1 bg-white rounded-full opacity-90 animate-pulse delay-1000"></div>
              <div className="absolute top-16 left-48 w-1 h-1 bg-white rounded-full opacity-70"></div>
              <div className="absolute top-6 left-64 w-1 h-1 bg-white rounded-full opacity-80 animate-pulse delay-2000"></div>
              <div className="absolute top-20 left-80 w-1 h-1 bg-white rounded-full opacity-60"></div>
              <div className="absolute top-10 left-96 w-1 h-1 bg-white rounded-full opacity-90"></div>
              <div className="absolute top-14 right-32 w-1 h-1 bg-white rounded-full opacity-70 animate-pulse delay-500"></div>
              <div className="absolute top-18 right-16 w-1 h-1 bg-white rounded-full opacity-80"></div>
              <div className="absolute top-8 right-8 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse delay-1500"></div>
            </div>
            
            {/* Header Content */}
            <div className="relative z-10 p-6 pt-12">
              <div className="flex justify-between items-center">
                <div>
                  <Headline className="text-white mb-1 text-3xl font-bold">
                    Welcome, {user.username || 'User'}
                  </Headline>
                  <Text className="text-gray-300 text-base">
                    Choose your AI companion
                  </Text>
                </div>
                <div className="text-right">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg border border-purple-500/30">
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-400 text-xl">⚡</span>
                      <span className="text-white font-bold text-xl">{energyBalance}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Companions Section */}
          <div className="p-4 space-y-6">

          {/* AI Companions List */}
          <div className="space-y-4">
            <Title className="text-white px-2">AI Companions</Title>
            <List className="space-y-4">
              {AI_COMPANIONS.map((companion) => (
                <Card 
                  key={companion.id}
                  className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer overflow-hidden"
                  onClick={() => handleCompanionSelect(companion)}
                >
                  <div className="relative">
                    {/* AI Girl Image */}
                    <div className="h-64 w-full relative overflow-hidden">
                      <Image
                        src={aiGirlImages[companion.id as keyof typeof aiGirlImages] || aiGirlImages.emanuelle}
                        alt={companion.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      
                      {/* Energy cost badge */}
                      <div className="absolute top-4 right-4">
                        <Badge type="number" className="bg-gray-700/90 text-white px-3 py-1 rounded-full flex items-center space-x-1">
                          <span className="text-yellow-400">⚡</span>
                          <span className="text-white text-sm font-medium">{companion.energyCost}</span>
                        </Badge>
                      </div>

                      {/* Premium badge */}
                      {companion.isPremium && (
                        <div className="absolute top-4 left-4">
                          <Badge type="dot" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full">
                            {companion.subscriptionTier}
                          </Badge>
                        </div>
                      )}

                      {/* Name overlay */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {companion.name}
                        </h3>
                        <p className="text-gray-200 text-sm mb-1">
                          {companion.description}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {companion.personality}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </List>
          </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 max-w-md w-full">
            <div className="p-8">
              <Title className="text-white mb-4">Welcome to Emanuelle</Title>
              <Text className="text-gray-300 mb-8 leading-relaxed">
                Your personal AI chat companion on Telegram. Choose from our collection of unique AI personalities.
              </Text>
              <Button 
                onClick={authenticateUser} 
                size="l"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105"
              >
                Login with Telegram
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
