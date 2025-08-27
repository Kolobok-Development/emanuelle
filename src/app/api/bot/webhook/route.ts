import { NextRequest, NextResponse } from 'next/server';
import { AI_COMPANIONS } from '@/data/ai-companions';
import { queueAIResponse } from '@/lib/queues/ai-response-queue';
import { sendTelegramMessage, sendChatAction } from '@/lib/telegram';

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
  const username = message.from?.username || message.from?.first_name;
  
  if (!text) return;

  console.log(`Received message in chat ${chatId}: ${text}`);

  // Show typing indicator immediately
  await sendChatAction(chatId, 'typing');

  try {
    // Determine which companion should respond
    const companion = await determineCompanionAndRespond(chatId, text, username);
    
    if (companion) {
      // Queue the AI response instead of generating it directly
      await queueAIResponse(chatId, text, companion, username, message.message_id);
      
      console.log(`AI response queued for companion: ${companion.name}`);
    } else {
      // Handle commands or unknown messages
      await handleCommand(chatId, text, username);
    }
  } catch (error) {
    console.error('Error handling message:', error);
    await sendTelegramMessage(chatId, '❌ Sorry, something went wrong. Please try again.');
  }
}

async function determineCompanionAndRespond(chatId: number, text: string, username?: string): Promise<Companion | null> {
  // Check if it's a command
  if (text.startsWith('/')) {
    await handleCommand(chatId, text, username);
    return null;
  }

  // Check if user mentioned a specific companion
  const mentionedCompanion = getMentionedCompanion(text);
  
  if (mentionedCompanion) {
    return mentionedCompanion;
  }

  // Default to Emanuelle if no specific companion mentioned
  return AI_COMPANIONS.find(c => c.id === 'emanuelle') || null;
}

function getMentionedCompanion(message: string): Companion | null {
  const lowerMessage = message.toLowerCase();
  
  for (const companion of AI_COMPANIONS) {
    if (lowerMessage.includes(companion.name.toLowerCase()) || 
        lowerMessage.includes(companion.id.toLowerCase()) ||
        lowerMessage.includes('chat with ' + companion.name.toLowerCase()) ||
        lowerMessage.includes('talk to ' + companion.name.toLowerCase()) ||
        lowerMessage.includes('switch to ' + companion.name.toLowerCase())) {
      return companion;
    }
  }
  
  return null;
}

async function handleCommand(chatId: number, command: string, username?: string) {
  const lowerCommand = command.toLowerCase();
  
  if (lowerCommand === '/start') {
    const welcomeMessage = `👋 Welcome ${username || 'there'}! I'm your AI companion bot.\n\n💬 You can chat with me naturally, or use these commands:\n/help - Show available commands\n/companions - List available AI companions\n\nJust start typing to begin chatting!`;
    await sendTelegramMessage(chatId, welcomeMessage);
  } else if (lowerCommand === '/help') {
    const helpMessage = `🤖 <b>Available Commands:</b>\n\n/start - Welcome message\n/help - Show this help\n/companions - List AI companions\n\n💡 <b>Tips:</b>\n• Mention a companion by name to chat with them\n• Example: "Chat with Sophia" or "Talk to Luna"\n• Each companion has unique personality and energy cost`;
    await sendTelegramMessage(chatId, helpMessage);
  } else if (lowerCommand === '/companions') {
    const companionsList = AI_COMPANIONS.map(c => 
      `${c.avatar} <b>${c.name}</b> - ${c.personality} (⚡ ${c.energyCost})`
    ).join('\n\n');
    
    const companionsMessage = `🤖 <b>Available AI Companions:</b>\n\n${companionsList}\n\n💡 Mention any companion by name to start chatting with them!`;
    await sendTelegramMessage(chatId, companionsMessage);
  } else {
    const unknownCommandMessage = `❓ Unknown command: ${command}\n\nUse /help to see available commands.`;
    await sendTelegramMessage(chatId, unknownCommandMessage);
  }
}
