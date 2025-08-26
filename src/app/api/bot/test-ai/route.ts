import { NextRequest, NextResponse } from 'next/server';
import generateMessage from '@/utils/services/ai/generateMessage';

export async function POST(request: NextRequest) {
  try {
    const { message, companionName, personality } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Test the AI service with a companion personality
    const systemMessage = `You are ${companionName || 'Emanuelle'}, an AI companion with the following personality: ${personality || 'Friendly, helpful, and always ready to chat'}. 

You should respond in character, maintaining your unique personality traits. Be engaging, helpful, and true to your character.`;

    const messages = [
      {
        role: "system",
        content: systemMessage
      },
      {
        role: "user", 
        content: message
      }
    ];

    // Generate AI response
    const aiResponse = await generateMessage(messages);
    
    return NextResponse.json({
      success: true,
      originalMessage: message,
      companionName: companionName || 'Emanuelle',
      personality: personality || 'Friendly, helpful, and always ready to chat',
      aiResponse: aiResponse,
      formattedResponse: `${companionName || 'Emanuelle'} responds: ${aiResponse?.choices?.[0]?.message?.content || aiResponse?.choices?.[0]?.text || 'No response generated'}`
    });

  } catch (error) {
    console.error('Test AI error:', error);
    return NextResponse.json({ 
      error: 'Failed to test AI service',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
