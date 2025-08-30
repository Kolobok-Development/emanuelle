import { prisma } from './prisma';
import { AICompanionService, AICompanion } from './ai-companions';

export interface ConversationMessage {
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
}

const memoryContext = new Map<number, Array<{ role: string; content: string }>>();

export class ConversationService {
  static async checkConnection(): Promise<boolean> {
    try {
      await prisma.users.count();
      return true;
    } catch (error) {
      console.error('Database connection check failed:', error);
      return false;
    }
  }

  static async getOrCreateChatFallback(chatId: number, telegramUserId: number, username?: string): Promise<string> {
    if (!memoryContext.has(chatId)) {
      memoryContext.set(chatId, []);
    }
    return `memory-${chatId}`;
  }

  static async saveMessageFallback(chatId: number, role: 'USER' | 'ASSISTANT' | 'SYSTEM', content: string): Promise<void> {
    if (!memoryContext.has(chatId)) {
      memoryContext.set(chatId, []);
    }
    memoryContext.get(chatId)!.push({ role, content });
  }

  static async getConversationHistoryFallback(chatId: number, limit: number = 10): Promise<ConversationMessage[]> {
    const messages = memoryContext.get(chatId) || [];
    return messages.slice(-limit).map(msg => ({
      role: msg.role as 'USER' | 'ASSISTANT' | 'SYSTEM',
      content: msg.content
    }));
  }

  static async getOrCreateChat(chatId: number, telegramUserId: number, username?: string, companionName?: string): Promise<string> {
    try {
      let user = await prisma.users.findUnique({
        where: { telegram_id: BigInt(telegramUserId) }
      });

      if (!user) {
        user = await prisma.users.create({
          data: {
            telegram_id: BigInt(telegramUserId),
            username: username || null,
          }
        });
        console.log(`Created new user with telegram ID: ${telegramUserId}`);
      }

      let companionId: string | null = null;
      if (companionName) {
        const companion = await AICompanionService.getCompanionByName(companionName);
        companionId = companion?.id || null;
      }

      let chat = await prisma.chat.findFirst({
        where: {
          user_id: user.id,
          title: `Chat ${chatId}`,
          is_active: true
        }
      });

      if (!chat) {
        chat = await prisma.chat.create({
          data: {
            user_id: user.id,
            title: `Chat ${chatId}`,
            companion_id: companionId,
            is_active: true
          }
        });
        console.log(`Created new chat ${chatId} for user: ${user.id} with companion: ${companionId || 'none'}`);
      } else if (companionId && chat.companion_id !== companionId) {
        chat = await prisma.chat.update({
          where: { id: chat.id },
          data: { companion_id: companionId }
        });
        console.log(`Updated chat ${chatId} companion to: ${companionId}`);
      }

      return chat.id;
    } catch (error: any) {
      console.error('Error in getOrCreateChat:', error);
      
      if (error.code === 'P2002') {
        console.log('User already exists, retrying...');
        try {
          const user = await prisma.users.findUnique({
            where: { telegram_id: BigInt(telegramUserId) }
          });
          if (user) {
            const chat = await prisma.chat.findFirst({
              where: {
                user_id: user.id,
                title: `Chat ${chatId}`,
                is_active: true
              }
            });
            if (chat) return chat.id;
          }
        } catch (retryError: any) {
          console.error('Retry failed:', retryError);
        }
      }
      
      throw new Error(`Failed to get or create chat: ${error.message || error}`);
    }
  }

  static async saveMessage(chatId: string, role: 'USER' | 'ASSISTANT' | 'SYSTEM', content: string): Promise<void> {
    try {
      await prisma.message.create({
        data: {
          chat_id: chatId,
          role: role,
          content: content
        }
      });
      console.log(`Saved ${role} message to chat: ${chatId}`);
    } catch (error) {
      console.error('Error saving message:', error);
      throw new Error(`Failed to save message: ${error}`);
    }
  }

  static async getConversationHistory(chatId: string, limit: number = 10): Promise<ConversationMessage[]> {
    try {
      const messages = await prisma.message.findMany({
        where: { chat_id: chatId },
        orderBy: { created_at: 'desc' },
        take: limit,
        select: {
          role: true,
          content: true
        }
      });

      const reversedMessages = messages.reverse();
      console.log(`Retrieved ${reversedMessages.length} messages for context from chat: ${chatId}`);
      return reversedMessages;
    } catch (error) {
      console.error('Error getting conversation history:', error);
      throw new Error(`Failed to get conversation history: ${error}`);
    }
  }

  static async getFormattedConversationHistory(chatId: string, limit: number = 10): Promise<Array<{ role: string; content: string }>> {
    try {
      const messages = await this.getConversationHistory(chatId, limit);
      
      const formattedMessages = messages.map(msg => ({
        role: msg.role === 'USER' ? 'user' : msg.role === 'ASSISTANT' ? 'assistant' : 'system',
        content: msg.content
      }));

      console.log(`Formatted ${formattedMessages.length} messages for AI context`);
      return formattedMessages;
    } catch (error) {
      console.error('Error formatting conversation history:', error);
      return [];
    }
  }

  static async clearConversation(chatId: string): Promise<void> {
    try {
      const deletedCount = await prisma.message.deleteMany({
        where: { chat_id: chatId }
      });
      console.log(`Cleared ${deletedCount.count} messages from chat: ${chatId}`);
    } catch (error) {
      console.error('Error clearing conversation:', error);
      throw new Error(`Failed to clear conversation: ${error}`);
    }
  }

  static async getConversationSummary(chatId: string): Promise<string> {
    try {
      const recentMessages = await this.getConversationHistory(chatId, 5);
      
      if (recentMessages.length === 0) {
        return "This is the start of a new conversation.";
      }

      const userMessages = recentMessages
        .filter(msg => msg.role === 'USER')
        .map(msg => msg.content)
        .slice(-3);

      if (userMessages.length === 0) {
        return "The conversation has just begun.";
      }

      return `Recent conversation context: ${userMessages.join(' | ')}`;
    } catch (error) {
      console.error('Error getting conversation summary:', error);
      return "Unable to retrieve conversation context.";
    }
  }

  static async getChatCompanion(chatId: string): Promise<AICompanion | null> {
    try {
      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        include: { companion: true }
      });
      
      return chat?.companion || null;
    } catch (error) {
      console.error('Error getting chat companion:', error);
      return null;
    }
  }

  static async setChatCompanion(chatId: string, companionId: string): Promise<boolean> {
    try {
      await prisma.chat.update({
        where: { id: chatId },
        data: { companion_id: companionId }
      });
      console.log(`Set companion ${companionId} for chat: ${chatId}`);
      return true;
    } catch (error) {
      console.error('Error setting chat companion:', error);
      return false;
    }
  }
}
