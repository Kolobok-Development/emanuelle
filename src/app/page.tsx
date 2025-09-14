'use client';

import { useAppContext } from '@/contexts/AppContext';
import { AI_COMPANIONS, type AICompanion } from '@/data/ai-companions';
import { 
  Card, 
  Button, 
  Text, 
  Title, 
  Spinner
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
        <div className="flex flex-col h-screen">
          {/* Header with Night Sky */}
          <div className="relative bg-gradient-to-b from-black via-gray-900 to-gray-800 min-h-[140px] overflow-hidden">
            {/* Stars */}
            <div className="absolute inset-0">
              <div className="absolute top-4 left-8 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute top-12 left-20 w-0.5 h-0.5 bg-white rounded-full opacity-40"></div>
              <div className="absolute top-8 left-36 w-1 h-1 bg-white rounded-full opacity-70"></div>
              <div className="absolute top-16 left-52 w-0.5 h-0.5 bg-white rounded-full opacity-30"></div>
              <div className="absolute top-6 left-68 w-1 h-1 bg-white rounded-full opacity-50"></div>
              <div className="absolute top-14 left-84 w-0.5 h-0.5 bg-white rounded-full opacity-40"></div>
              <div className="absolute top-10 right-32 w-1 h-1 bg-white rounded-full opacity-60"></div>
              <div className="absolute top-18 right-16 w-0.5 h-0.5 bg-white rounded-full opacity-35"></div>
              <div className="absolute top-4 right-8 w-1 h-1 bg-white rounded-full opacity-45"></div>
            </div>
            
            {/* Header Content */}
            <div className="relative z-10 p-4 pt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="text-center">
                    <h1 className="text-white font-bold text-lg">Your Waifu</h1>
                    <p className="text-gray-400 text-xs">мини-приложение</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
              
              {/* User Greeting and Resources */}
              <div className="mt-4 flex justify-between items-center">
                <div>
                  <h2 className="text-white text-lg font-semibold">Привет | {user.username || 'Player'}</h2>
                  <p className="text-gray-300 text-sm">Пора общаться!</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2 rounded-full shadow-lg">
                    <div className="flex items-center space-x-1">
                      <span className="text-white text-sm">💎</span>
                      <span className="text-white text-sm font-semibold">5</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-2 rounded-full shadow-lg">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400 text-sm">⚡</span>
                      <span className="text-white text-sm font-semibold">{energyBalance}</span>
                    </div>
                  </div>
                  <button className="bg-gradient-to-r from-pink-500 to-pink-600 w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                    <span className="text-white text-sm">+</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Character Category Tabs */}
          <div className="bg-gray-800/50 backdrop-blur-sm px-4 py-3 border-b border-gray-700/50">
            <div className="flex space-x-2">
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg">
                <span className="text-sm">♀</span>
                <span className="text-sm font-semibold">ДЕВУШКИ</span>
              </button>
              <button className="bg-gray-700/50 text-gray-300 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-600/50 transition-colors">
                <span className="text-sm">♂</span>
                <span className="text-sm font-semibold">ПАРНИ</span>
              </button>
            </div>
          </div>

          {/* Character Grid */}
          <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-800/30 to-gray-900/50">
            <div className="grid grid-cols-2 gap-4">
              {AI_COMPANIONS.map((companion) => (
                <Card 
                  key={companion.id}
                  className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 cursor-pointer hover:bg-gray-700/50 transition-all duration-200 overflow-hidden shadow-lg hover:shadow-xl"
                  onClick={() => handleCompanionSelect(companion)}
                >
                  <div className="relative">
                    {/* Character Image */}
                    <div className="h-48 w-full relative overflow-hidden">
                      <Image
                        src={aiGirlImages[companion.id as keyof typeof aiGirlImages] || aiGirlImages.emanuelle}
                        alt={companion.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {/* Energy cost badge */}
                      <div className="absolute top-2 right-2">
                        <div className="bg-gray-900/80 backdrop-blur-sm text-white px-2 py-1 rounded-full flex items-center space-x-1 border border-gray-600/50">
                          <span className="text-yellow-400 text-xs">⚡</span>
                          <span className="text-white text-xs font-medium">{companion.energyCost}</span>
                        </div>
                      </div>

                      {/* Premium badge */}
                      {companion.isPremium && (
                        <div className="absolute top-2 left-2">
                          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            {companion.subscriptionTier}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Character Info */}
                    <div className="p-3">
                      <h3 className="text-white font-semibold text-sm mb-1">
                        {companion.name}
                      </h3>
                      <p className="text-gray-300 text-xs">
                        {companion.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="bg-gray-800/50 backdrop-blur-sm border-t border-gray-700/50 px-4 py-2">
            <div className="flex justify-around">
              <button className="flex flex-col items-center space-y-1 py-2">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/>
                  </svg>
                </div>
                <span className="text-purple-400 text-xs font-semibold">Главная</span>
              </button>
              <button className="flex flex-col items-center space-y-1 py-2 hover:bg-gray-700/30 rounded-lg transition-colors">
                <div className="w-6 h-6 text-gray-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-gray-400 text-xs">Чаты</span>
              </button>
              <button className="flex flex-col items-center space-y-1 py-2 hover:bg-gray-700/30 rounded-lg transition-colors">
                <div className="w-6 h-6 text-gray-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
                <span className="text-gray-400 text-xs">Магазин</span>
              </button>
              <button className="flex flex-col items-center space-y-1 py-2 hover:bg-gray-700/30 rounded-lg transition-colors">
                <div className="w-6 h-6 text-gray-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-gray-400 text-xs">Задания</span>
              </button>
              <button className="flex flex-col items-center space-y-1 py-2 hover:bg-gray-700/30 rounded-lg transition-colors">
                <div className="w-6 h-6 text-gray-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-gray-400 text-xs">Профиль</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 max-w-md w-full shadow-xl">
            <div className="p-8">
              <Title className="text-white mb-4">Welcome to Emanuelle</Title>
              <Text className="text-gray-300 mb-8 leading-relaxed">
                Your personal AI chat companion on Telegram. Choose from our collection of unique AI personalities.
              </Text>
              <Button 
                onClick={authenticateUser} 
                size="l"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg"
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
