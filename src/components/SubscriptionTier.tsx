'use client';

import { Card, Button } from '@telegram-apps/telegram-ui';
import { User, SubscriptionTier as SubscriptionTierEnum } from '@/types/auth';

interface SubscriptionTierProps {
  user: User;
}

const getTierInfo = (tier: SubscriptionTierEnum) => {
  switch (tier) {
    case SubscriptionTierEnum.FREE:
      return {
        name: 'Free',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        features: ['5 messages per day', 'Basic responses', 'Standard support']
      };
    case SubscriptionTierEnum.BASIC:
      return {
        name: 'Basic',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        features: ['50 messages per day', 'Enhanced responses', 'Priority support']
      };
    case SubscriptionTierEnum.PREMIUM:
      return {
        name: 'Premium',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        features: ['Unlimited messages', 'Advanced AI models', '24/7 support']
      };
    case SubscriptionTierEnum.ULTIMATE:
      return {
        name: 'Ultimate',
        color: 'text-primary-600',
        bgColor: 'bg-primary-100',
        features: ['Everything in Premium', 'Custom AI training', 'Dedicated support']
      };
    default:
      return {
        name: 'Unknown',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        features: []
      };
  }
};

export const SubscriptionTier = ({ user }: SubscriptionTierProps) => {
  const tierInfo = getTierInfo(user.subscription_tier);
  const isExpired = user.subscription_expires && new Date(user.subscription_expires) < new Date();

  return (
    <Card>
      <Card.Cell>
        <h3 className="text-lg font-semibold mb-3">Subscription</h3>
        
        <div className={`p-3 rounded-lg ${tierInfo.bgColor} mb-4`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`font-semibold ${tierInfo.color}`}>
              {tierInfo.name} Plan
            </span>
            {isExpired && (
              <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                Expired
              </span>
            )}
          </div>
          
          {user.subscription_expires && (
            <p className="text-xs text-gray-600">
              Expires: {new Date(user.subscription_expires).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="space-y-2 mb-4">
          {tierInfo.features.map((feature, index) => (
            <div key={index} className="flex items-center text-sm">
              <span className="text-green-500 mr-2">✓</span>
              {feature}
            </div>
          ))}
        </div>

        {user.subscription_tier === SubscriptionTierEnum.FREE && (
          <Button
            mode="filled"
            stretched
            className="bg-gradient-to-r from-primary-500 to-secondary-500"
            onClick={() => window.location.href = '/upgrade'}
          >
            Upgrade Now
          </Button>
        )}

        {user.subscription_tier !== SubscriptionTierEnum.FREE && (
          <Button
            mode="outline"
            stretched
            onClick={() => window.location.href = '/subscription'}
          >
            Manage Subscription
          </Button>
        )}
      </Card.Cell>
    </Card>
  );
};
