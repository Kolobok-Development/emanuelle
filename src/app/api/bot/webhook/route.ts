import { NextRequest, NextResponse } from 'next/server';

interface TelegramMessage {
  chat: { id: number };
  text: string;
  from: { id: number; username?: string };
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
  const { chat, text, from } = message;
  
  if (!text || !from) return;

  try {
    // Check if it's a command
    if (text.startsWith('/')) {
      await handleCommand(text, chat.id);
      return;
    }

    // Generate AI response with proper companion selection
    const aiResponse = await generateCompanionResponse(text, from.username);

    // Send response back to Telegram
    await sendTelegramMessage(chat.id, aiResponse);

  } catch (error) {
    console.error('Error handling message:', error);
    await sendTelegramMessage(chat.id, "Sorry, I'm having trouble processing your message right now. Please try again later.");
  }
}

async function generateCompanionResponse(userMessage: string, username?: string): Promise<string> {
  // Check if user mentioned a specific companion
  const mentionedCompanion = getMentionedCompanion(userMessage);
  
  if (mentionedCompanion) {
    // User explicitly mentioned a companion - use that one
    return generateResponseForCompanion(userMessage, mentionedCompanion, username);
  }

  // Default to Emanuelle if no specific companion mentioned
  const defaultCompanion: Companion = { 
    id: 'emanuelle', 
    name: 'Emanuelle', 
    avatar: '🤖', 
    personality: 'Friendly, helpful, and always ready to chat',
    energyCost: 5 
  };
  
  return generateResponseForCompanion(userMessage, defaultCompanion, username);
}

function getMentionedCompanion(message: string): Companion | null {
  const companions: Companion[] = [
    { id: 'emanuelle', name: 'Emanuelle', avatar: '🤖', personality: 'Friendly, helpful, and always ready to chat', energyCost: 5 },
    { id: 'sophia', name: 'Sophia', avatar: '🧠', personality: 'Wise, analytical, and loves intellectual challenges', energyCost: 10 },
    { id: 'luna', name: 'Luna', avatar: '🌙', personality: 'Creative, imaginative, and inspiring', energyCost: 8 },
    { id: 'atlas', name: 'Atlas', avatar: '🗺️', personality: 'Adventurous, curious, and loves to explore', energyCost: 12 },
    { id: 'nova', name: 'Nova', avatar: '⭐', personality: 'Sophisticated, insightful, and highly intelligent', energyCost: 15 },
    { id: 'zen', name: 'Zen', avatar: '🧘', personality: 'Customizable, adaptive, and deeply personal', energyCost: 20 }
  ];

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
  
  return null;
}

function generateResponseForCompanion(userMessage: string, companion: Companion, username?: string): string {
  let response = `${companion.avatar} <b>${companion.name}</b>\n\n`;
  
  // Generate companion-specific response based on personality
  switch (companion.id) {
    case 'emanuelle':
      response += `Hello ${username || 'there'}! I'm Emanuelle, your friendly AI companion. I'm here to help you with everyday conversations and tasks. What would you like to talk about today?`;
      break;
    case 'sophia':
      response += `Greetings! I'm Sophia, and I love intellectual challenges. Your message "${userMessage}" is quite interesting. Let me analyze this... What specific aspect would you like to explore further?`;
      break;
    case 'luna':
      response += `✨ Hello! I'm Luna, and I'm feeling very creative today! Your message has inspired me. Let's explore the artistic and imaginative side of things together. What creative project or idea would you like to discuss?`;
      break;
    case 'atlas':
      response += `🗺️ Adventure awaits! I'm Atlas, and I'm always ready for exploration. Your message makes me think of new journeys and discoveries. Where would you like to explore today - real places, fictional worlds, or new ideas?`;
      break;
    case 'nova':
      response += `⭐ Greetings! I'm Nova, and I'm here to provide sophisticated insights. Your message shows thoughtful consideration. Let me offer you some advanced perspectives on this topic. What specific aspect would you like me to elaborate on?`;
      break;
    case 'zen':
      response += `🧘 Namaste! I'm Zen, and I'm here to help you find balance and clarity. Your message resonates with me. Let's explore this together with mindfulness and wisdom. What would bring you peace and understanding right now?`;
      break;
    default:
      response += `Hello! I'm here to help you. Your message "${userMessage}" is interesting. How can I assist you today?`;
  }

  // Add companion info and energy cost (without HTML tags)
  response += `\n\n💬 ${companion.personality}\n⚡ Energy cost: ${companion.energyCost}`;
  
  return response;
}

async function handleCommand(command: string, chatId: number) {
  try {
    const commandName = command.split(' ')[0].substring(1);
    
    let response = '';
    
    switch (commandName) {
      case 'start':
        response = `🎉 Welcome! I'm your AI companion bot.

I have multiple AI personalities to choose from:
• Emanuelle - Friendly and helpful
• Sophia - Intellectual and analytical  
• Luna - Creative and imaginative
• Atlas - Adventurous and curious
• Nova - Sophisticated and insightful
• Zen - Mindful and wise

<b>How to chat with specific companions:</b>
• Say "Chat with Sophia" to talk to Sophia
• Say "Talk to Luna" to chat with Luna
• Say "Switch to Atlas" to chat with Atlas
• Just send a message to chat with Emanuelle (default)

Type /help for more commands!`;
        break;
      case 'help':
        response = `🤖 <b>Available Commands:</b>

/start - Start the bot and get welcome message
/help - Show this help message
/companions - List available AI companions

<b>How to chat with specific companions:</b>
• Say "Chat with Sophia" to talk to Sophia
• Say "Talk to Luna" to chat with Luna
• Say "Switch to [Name]" to change companions
• Just send a message to chat with Emanuelle (default)

<b>Energy System:</b>
Each message costs energy based on the companion you're chatting with.`;
        break;
      case 'companions':
        response = `🤖 <b>Available Companions:</b>

🤖 Emanuelle - Friendly and helpful (5⚡)
🧠 Sophia - Intellectual and analytical (10⚡)
🌙 Luna - Creative and imaginative (8⚡)
🗺️ Atlas - Adventurous and curious (12⚡)
⭐ Nova - Sophisticated and insightful (15⚡)
🧘 Zen - Mindful and wise (20⚡)

<b>How to chat with them:</b>
• Say "Chat with [Name]" to start chatting
• Say "Switch to [Name]" to change companions
• Or just send a message to chat with Emanuelle`;
        break;
      default:
        response = `Unknown command: ${commandName}. Type /help for available commands.`;
    }
    
    await sendTelegramMessage(chatId, response);

  } catch (error) {
    console.error('Error handling command:', error);
    await sendTelegramMessage(chatId, "Sorry, I'm having trouble processing your command. Please try again later.");
  }
}

async function sendTelegramMessage(chatId: number, text: string) {
  const botToken = process.env.TELEGRAM_BOT_KEY;
  if (!botToken) {
    console.error('TELEGRAM_BOT_KEY not found');
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      console.error('Failed to send Telegram message:', await response.text());
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}
