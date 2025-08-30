export interface AICompanion {
  id: string;
  name: string;
  avatar: string;
  description: string;
  personality: string;
  energyCost: number;
  isPremium: boolean;
  subscriptionTier: 'FREE' | 'BASIC' | 'PREMIUM' | 'ULTIMATE';
}

export const AI_COMPANIONS: AICompanion[] = [
  {
    id: 'emanuelle',
    name: 'Emanuelle',
    avatar: '🤖',
    description: 'Your friendly AI companion for everyday conversations',
    personality: 'Friendly, helpful, and always ready to chat',
    energyCost: 5,
    isPremium: false,
    subscriptionTier: 'FREE'
  },
  {
    id: 'sophia',
    name: 'Sophia',
    avatar: '🧠',
    description: 'Intellectual companion for deep discussions and learning',
    personality: 'Wise, analytical, and loves intellectual challenges',
    energyCost: 10,
    isPremium: false,
    subscriptionTier: 'FREE'
  },
  {
    id: 'luna',
    name: 'Luna',
    avatar: '🌙',
    description: 'Creative companion for artistic and imaginative conversations',
    personality: 'Creative, imaginative, and inspiring',
    energyCost: 8,
    isPremium: false,
    subscriptionTier: 'FREE'
  },
  {
    id: 'atlas',
    name: 'Atlas',
    avatar: '🗺️',
    description: 'Adventure companion for travel stories and exploration',
    personality: 'Adventurous, curious, and loves to explore',
    energyCost: 12,
    isPremium: true,
    subscriptionTier: 'BASIC'
  },
  {
    id: 'nova',
    name: 'Nova',
    avatar: '⭐',
    description: 'Premium companion with advanced AI capabilities',
    personality: 'Sophisticated, insightful, and highly intelligent',
    energyCost: 15,
    isPremium: true,
    subscriptionTier: 'PREMIUM'
  },
  {
    id: 'zen',
    name: 'Zen',
    avatar: '🧘',
    description: 'Ultimate companion with custom personality training',
    personality: 'Customizable, adaptive, and deeply personal',
    energyCost: 20,
    isPremium: true,
    subscriptionTier: 'ULTIMATE'
  }
];

export const getCompanionsByTier = (subscriptionTier: string) => {
  return AI_COMPANIONS.filter(companion => {
    if (subscriptionTier === 'ULTIMATE') return true;
    if (subscriptionTier === 'PREMIUM') return companion.subscriptionTier !== 'ULTIMATE';
    if (subscriptionTier === 'BASIC') return companion.subscriptionTier === 'FREE' || companion.subscriptionTier === 'BASIC';
    return companion.subscriptionTier === 'FREE';
  });
};
