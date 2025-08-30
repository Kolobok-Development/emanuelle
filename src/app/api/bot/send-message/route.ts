import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';
import { AICompanionService } from '@/lib/ai-companions';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramUserId, companionName, message } = body;

    if (!telegramUserId || !companionName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const companion = await AICompanionService.getCompanionByName(companionName);
    if (!companion) {
      return NextResponse.json({ error: 'Companion not found' }, { status: 404 });
    }

    const welcomeMessage = `${companion.avatar} <b>${companion.name}</b>\n\nHello! I'm ${companion.name}. ${companion.description}\n\nI'm so excited to start our conversation! What would you like to talk about today?`;

    await sendTelegramMessage(telegramUserId, welcomeMessage);

    try {
      await prisma.companionSelection.upsert({
        where: { telegram_user_id: BigInt(telegramUserId) },
        update: { 
          companion_id: companion.id,
          selected_at: new Date()
        },
        create: {
          telegram_user_id: BigInt(telegramUserId),
          companion_id: companion.id,
          selected_at: new Date()
        }
      });
      console.log(`Set companion selection for user ${telegramUserId} to ${companion.name}`);
    } catch (error) {
      console.error('Error setting companion selection:', error);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully',
      companion: companion.name
    });

  } catch (error) {
    console.error('Error sending bot message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
