export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  allows_write_to_pm?: boolean;
}

export interface User {
  id: string;
  telegram_id: bigint;
  username?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  isTermsPolicyAccepted: boolean;
  subscription_tier: SubscriptionTier;
  subscription_expires?: Date;
  created_at: Date;
  updated_at: Date;
  settings?: UserSettings;
}

export interface UserSettings {
  id: string;
  user_id: string;
  tone?: string;
  nsfw_enabled: boolean;
  language: string;
  theme: string;
  updated_at: Date;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export interface Chat {
  id: string;
  user_id: string;
  title?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  messages?: Message[];
}

export interface Message {
  id: string;
  chat_id: string;
  role: ChatRole;
  content: string;
  tokens_used?: number;
  created_at: Date;
}

export interface SubscriptionHistory {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  amount: number;
  currency: string;
  payment_method?: string;
  status: string;
  expires_at: Date;
  created_at: Date;
}

export enum SubscriptionTier {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ULTIMATE = 'ULTIMATE'
}

export enum ChatRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM'
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (telegramUser: TelegramUser) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}
