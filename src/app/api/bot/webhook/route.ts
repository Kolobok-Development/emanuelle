import { NextRequest, NextResponse } from 'next/server';
import { AICompanionService, AICompanion } from '@/lib/ai-companions';
import { queueAIResponse } from '@/lib/queues/ai-response-queue';
import { sendTelegramMessage, sendChatAction } from '@/lib/telegram';
import { ConversationService } from '@/lib/conversation';
import { prisma } from '@/lib/prisma';

interface TelegramMessage {
  message_id: number;
  chat: { id: number };
  text: string;
  from: { id: number; username?: string; first_name?: string };
}

interface Companion {
  id: string;
  name: string;
  avatar: string;
  personality: string;
  energyCost: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Webhook received:', body);

    if (body.message) {
      await handleMessage(body.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleMessage(message: TelegramMessage) {
  const chatId = message.chat.id;
  const text = message.text;
  const telegramUserId = message.from?.id;
  const username = message.from?.username || message.from?.first_name;
  
  if (!text) return;

  console.log(`Received message in chat ${chatId} from user ${telegramUserId}: ${text}`);

  await sendChatAction(chatId, 'typing');

  try {
    const isConnected = await ConversationService.checkConnection();
    let dbChatId: string | null = null;

    if (isConnected && telegramUserId) {
      try {
        dbChatId = await ConversationService.getOrCreateChat(chatId, telegramUserId, username);
        await ConversationService.saveMessage(dbChatId, 'USER', text);
        console.log(`Message saved to database for user ${telegramUserId}, chat: ${dbChatId}`);
      } catch (dbError) {
        console.error('Database operation failed, using in-memory fallback:', dbError);
        try {
          dbChatId = await ConversationService.getOrCreateChatFallback(chatId, telegramUserId, username);
          await ConversationService.saveMessageFallback(chatId, 'USER', text);
          console.log(`Message saved to in-memory context for chat: ${chatId}`);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
    } else {
      if (!telegramUserId) {
        console.log('No Telegram user ID found, proceeding without context');
      } else {
        console.log('Database not connected, using in-memory fallback');
        try {
          dbChatId = await ConversationService.getOrCreateChatFallback(chatId, telegramUserId, username);
          await ConversationService.saveMessageFallback(chatId, 'USER', text);
          console.log(`Message saved to in-memory context for chat: ${chatId}`);
        } catch (fallbackError) {
          console.error('Fallback failed:', fallbackError);
        }
      }
    }

    // Determine which companion should respond
    const companion = await determineCompanionAndRespond(chatId, text, username, telegramUserId);
    
    if (companion) {
      await queueAIResponse(chatId, text, companion, username, message.message_id, dbChatId || undefined);
      
      console.log(`AI response queued for companion: ${companion.name}`);
    } else {
      await handleCommand(chatId, text, username, telegramUserId);
    }
  } catch (error) {
    console.error('Error handling message:', error);
    await sendTelegramMessage(chatId, '❌ Sorry, something went wrong. Please try again.');
  }
}

async function determineCompanionAndRespond(chatId: number, text: string, username?: string, telegramUserId?: number): Promise<AICompanion | null> {
  if (text.startsWith('/')) {
    await handleCommand(chatId, text, username);
    return null;
  }

  const mentionedCompanion = await getMentionedCompanion(text);
  
  if (mentionedCompanion) {
    if (telegramUserId) {
      try {
        const dbChatId = await ConversationService.getOrCreateChat(chatId, telegramUserId, username);
        await ConversationService.setChatCompanion(dbChatId, mentionedCompanion.id);
        console.log(`Switched conversation to ${mentionedCompanion.name}`);
      } catch (error) {
        console.error('Error setting chat companion:', error);
      }
    }
    return mentionedCompanion;
  }

  if (telegramUserId) {
    try {
      const recentSelection = await prisma.companionSelection.findUnique({
        where: { telegram_user_id: BigInt(telegramUserId) },
        include: { companion: true }
      });
      
      if (recentSelection && recentSelection.companion) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (recentSelection.selected_at > fiveMinutesAgo) {
          console.log(`Using recent companion selection: ${recentSelection.companion.name}`);
          
          try {
            const dbChatId = await ConversationService.getOrCreateChat(chatId, telegramUserId, username);
            await ConversationService.setChatCompanion(dbChatId, recentSelection.companion.id);
          } catch (error) {
            console.error('Error setting chat companion:', error);
          }
          
          return recentSelection.companion;
        }
      }
    } catch (error) {
      console.error('Error checking companion selection:', error);
    }
  }

  console.log('No companion context found, defaulting to Emanuelle');
  return await AICompanionService.getCompanionByName('Emanuelle');
}

async function getMentionedCompanion(message: string): Promise<AICompanion | null> {
  try {
    const companions = await AICompanionService.getAllCompanions();
    const lowerMessage = message.toLowerCase();
    
    for (const companion of companions) {
      if (lowerMessage.includes(companion.name.toLowerCase()) || 
          lowerMessage.includes(companion.id.toLowerCase()) ||
          lowerMessage.includes('chat with ' + companion.name.toLowerCase()) ||
          lowerMessage.includes('talk to ' + companion.name.toLowerCase()) ||
          lowerMessage.includes('switch to ' + companion.name.toLowerCase())) {
        return companion;
      }
    }
  } catch (error) {
    console.error('Error getting mentioned companion:', error);
  }
  
  return null;
}

async function handleCommand(chatId: number, command: string, username?: string, telegramUserId?: number) {
  const lowerCommand = command.toLowerCase();
  
  if (lowerCommand === '/start') {
    const welcomeMessage = `👋 Welcome ${username || 'there'}! I'm your AI companion bot.\n\n💬 You can chat with me naturally, or use these commands:\n/help - Show available commands\n/companions - List available AI companions\n\nJust start typing to begin chatting!`;
    await sendTelegramMessage(chatId, welcomeMessage);
  } else if (lowerCommand === '/help') {
    const helpMessage = `🤖 <b>Available Commands:</b>\n\n/start - Welcome message\n/help - Show this help\n/companions - List AI companions\n/clear - Clear conversation history\n\n💡 <b>Tips:</b>\n• Mention a companion by name to chat with them\n• Example: "Chat with Sophia" or "Talk to Luna"\n• Each companion has unique personality and energy cost\n• Your conversations are remembered for context`;
    await sendTelegramMessage(chatId, helpMessage);
  } else if (lowerCommand === '/companions') {
    try {
      const companions = await AICompanionService.getAllCompanions();
      const companionsList = companions.map(c => 
        `${c.avatar} <b>${c.name}</b> - ${c.description} (⚡ ${c.energyCost})`
      ).join('\n\n');
      
      const companionsMessage = `🤖 <b>Available AI Companions:</b>\n\n${companionsList}\n\n💡 Mention any companion by name to start chatting with them!`;
      await sendTelegramMessage(chatId, companionsMessage);
    } catch (error) {
      console.error('Error fetching companions for command:', error);
      await sendTelegramMessage(chatId, '❌ Unable to fetch companions. Please try again.');
    }
  } else if (lowerCommand === '/clear') {
    if (telegramUserId) {
      try {
        const dbChatId = await ConversationService.getOrCreateChat(chatId, telegramUserId, username);
        await ConversationService.clearConversation(dbChatId);
        const clearMessage = `🧹 <b>Conversation cleared!</b>\n\nYour chat history has been reset. You can start a fresh conversation now.`;
        await sendTelegramMessage(chatId, clearMessage);
      } catch (error) {
        console.error('Failed to clear conversation:', error);
        await sendTelegramMessage(chatId, '❌ Failed to clear conversation. Please try again.');
      }
    } else {
      await sendTelegramMessage(chatId, '❌ Unable to identify user. Please try again.');
    }
  } else {
    const unknownCommandMessage = `❓ Unknown command: ${command}\n\nUse /help to see available commands.`;
    await sendTelegramMessage(chatId, unknownCommandMessage);
  }
}
