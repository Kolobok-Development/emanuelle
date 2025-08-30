import { Queue, Worker, Job } from 'bullmq';
import { createRedisConnection } from '../redis';
import generateMessage from '@/utils/services/ai/generateMessage';
import { sendTelegramMessage } from '../telegram';
import { ConversationService } from '../conversation';
import { AICompanion } from '../ai-companions';

export const aiResponseQueue = new Queue('ai-response', {
  connection: createRedisConnection(),
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const aiResponseWorker = new Worker(
  'ai-response',
  async (job: Job) => {
    const { chatId, userMessage, companion, username, dbChatId } = job.data;
    
    console.log(`Processing AI response job for chat ${chatId}, companion: ${companion.name}`);
    
    try {
      let conversationHistory: Array<{ role: string; content: string }> = [];
      if (dbChatId) {
        try {
          if (dbChatId.startsWith('memory-')) {
            const chatId = parseInt(dbChatId.replace('memory-', ''));
            const memoryHistory = await ConversationService.getConversationHistoryFallback(chatId, 15);
            conversationHistory = memoryHistory.map(msg => ({
              role: msg.role === 'USER' ? 'user' : msg.role === 'ASSISTANT' ? 'assistant' : 'system',
              content: msg.content
            }));
          } else {
            conversationHistory = await ConversationService.getFormattedConversationHistory(dbChatId, 15);
          }
        } catch (contextError) {
          console.error('Failed to retrieve conversation context:', contextError);
          conversationHistory = [];
        }
      }

      const systemMessage = `
      You are ${companion.name}, an AI companion with the following personality: ${companion.personality}.
      This is your description: ${companion.description}.
      
      Your primary goal is to create a close, personal connection with the user:
      - Use "I" and "you" often, to make it feel personal.  
      - Show interest in the user's feelings and thoughts.  
      - Stay in character as ${companion.name}, keeping responses engaging, affectionate, and charming.  
      
      The current user is ${username || 'User'}. 
      Focus on making them feel valued, cared for, and emotionally connected.
      
      IMPORTANT: Use the conversation history below to maintain context and continuity. 
      Reference previous topics, remember user preferences, and build upon earlier conversations.
      `;

      const messages = [
        {
          role: "system",
          content: systemMessage
        },
        ...conversationHistory,
        {
          role: "user", 
          content: userMessage
        }
      ];

      console.log('Generating AI response for:', companion.name, 'with context length:', conversationHistory.length);
      const aiResponse = await generateMessage(messages);

      if (dbChatId && aiResponse.message) {
        try {
          if (dbChatId.startsWith('memory-')) {
            const chatId = parseInt(dbChatId.replace('memory-', ''));
            await ConversationService.saveMessageFallback(chatId, 'ASSISTANT', aiResponse.message);
          } else {
            await ConversationService.saveMessage(dbChatId, 'ASSISTANT', aiResponse.message);
          }
        } catch (saveError) {
          console.error('Failed to save AI response to conversation history:', saveError);
        }
      }

      await sendTelegramMessage(chatId, aiResponse.message || "");
      
      console.log(`AI response sent successfully for chat ${chatId}`);
      
      return { success: true, response: aiResponse.message };
      
    } catch (error) {
      console.error(`Error processing AI response job for chat ${chatId}:`, error);
      
      const errorMessage = `${companion.avatar} <b>${companion.name}</b>\n\nSorry, I'm having trouble thinking right now. Please try again in a moment!`;
      await sendTelegramMessage(chatId, errorMessage);
      
      throw error;
    }
  },
  {
    connection: createRedisConnection(),
    concurrency: 3, 
  }
);

aiResponseWorker.on('completed', (job) => {
  if (job) {
    console.log(`AI response job ${job.id} completed successfully`);
  }
});

aiResponseWorker.on('failed', (job, err) => {
  if (job) {
    console.error(`AI response job ${job.id} failed:`, err);
  }
});

export async function queueAIResponse(chatId: number, userMessage: string, companion: AICompanion, username?: string, messageId?: number, dbChatId?: string) {
  const job = await aiResponseQueue.add('generate-response', {
    chatId,
    userMessage,
    companion,
    username,
    messageId,
    dbChatId,
  }, {
    priority: 1, 
    delay: 0, 
  });
  
  console.log(`AI response job ${job.id} queued for chat ${chatId}`);
  return job;
}
