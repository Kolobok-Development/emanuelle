import { Queue, Worker, Job } from 'bullmq';
import { createRedisConnection } from '../redis';
import generateMessage from '@/utils/services/ai/generateMessage';
import { sendTelegramMessage } from '../telegram';

// Queue for AI response generation
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

// Worker to process AI response jobs
export const aiResponseWorker = new Worker(
  'ai-response',
  async (job: Job) => {
    const { chatId, userMessage, companion, username } = job.data;
    
    console.log(`Processing AI response job for chat ${chatId}, companion: ${companion.name}`);
    
    try {
      // Generate AI response
      const systemMessage = `You are ${companion.name}, an AI companion with the following personality: ${companion.personality}. 

You should respond in character as ${companion.name}, maintaining your unique personality traits. Be engaging, helpful, and true to your character.

Current user: ${username || 'User'}`;

      const messages = [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user", 
          content: userMessage
        }
      ];

      console.log('Generating AI response for:', companion.name);
      const aiResponse = await generateMessage(messages);
      
      let responseText = '';
      if (aiResponse && aiResponse.choices && aiResponse.choices[0]) {
        responseText = aiResponse.choices[0].message?.content || aiResponse.choices[0].text || 'Sorry, I could not generate a response.';
      } else if (aiResponse && aiResponse.response) {
        responseText = aiResponse.response;
      } else {
        responseText = `Hello ${username || 'there'}! I'm ${companion.name}. ${companion.personality}`;
      }

      // Format the response
      const formattedResponse = `${companion.avatar} <b>${companion.name}</b>\n\n${responseText}\n\n💬 ${companion.personality}\n⚡ Energy cost: ${companion.energyCost}`;

      // Send the response to Telegram
      await sendTelegramMessage(chatId, formattedResponse);
      
      console.log(`AI response sent successfully for chat ${chatId}`);
      
      return { success: true, response: formattedResponse };
      
    } catch (error) {
      console.error(`Error processing AI response job for chat ${chatId}:`, error);
      
      // Send error message to user
      const errorMessage = `${companion.avatar} <b>${companion.name}</b>\n\nSorry, I'm having trouble thinking right now. Please try again in a moment!`;
      await sendTelegramMessage(chatId, errorMessage);
      
      throw error;
    }
  },
  {
    connection: createRedisConnection(),
    concurrency: 3, // Process max 3 jobs simultaneously
  }
);

// Handle worker events
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

// Function to add AI response job to queue
export async function queueAIResponse(chatId: number, userMessage: string, companion: { id: string; name: string; avatar: string; personality: string; energyCost: number }, username?: string, messageId?: number) {
  const job = await aiResponseQueue.add('generate-response', {
    chatId,
    userMessage,
    companion,
    username,
    messageId,
  }, {
    priority: 1, // High priority
    delay: 0, // No delay
  });
  
  console.log(`AI response job ${job.id} queued for chat ${chatId}`);
  return job;
}
