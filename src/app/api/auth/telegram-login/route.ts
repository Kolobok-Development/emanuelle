import { NextRequest, NextResponse } from 'next/server';
import { isValid } from '@telegram-apps/init-data-node/web';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json();
    console.log('initData', initData);

    if (!initData) {
      return NextResponse.json(
        { error: 'No initData provided' },
        { status: 400 }
      );
    }

    // Verify the initData using your bot token
    const botToken = process.env.TELEGRAM_BOT_KEY;
    if (!botToken) {
      console.error('TELEGRAM_BOT_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'Bot token not configured' },
        { status: 500 }
      );
    }

    const isAuthorized = isValid(initData, botToken);
    if (!isAuthorized) {
      console.log('Not authorized error');
      return NextResponse.json(
        { error: 'Invalid initData' },
        { status: 401 }
      );
    }

    // Parse the initData to extract user information
    const urlParams = new URLSearchParams(initData);
    const userStr = urlParams.get('user');
    
    if (!userStr) {
      return NextResponse.json(
        { error: 'No user data in initData' },
        { status: 400 }
      );
    }

    const telegramUser = JSON.parse(decodeURIComponent(userStr));
    
    if (!telegramUser.id) {
      return NextResponse.json(
        { error: 'Invalid user data' },
        { status: 400 }
      );
    }

    // Find or create user in database
    let user = await prisma.users.findUnique({
      where: { telegram_id: telegramUser.id.toString() },
      include: { settings: true }
    });

    if (!user) {
      // Create new user
      user = await prisma.users.create({
        data: {
          telegram_id: telegramUser.id.toString(),
          username: telegramUser.username || null,
          subscription_tier: 'FREE',
          subscription_expires: null,
          settings: {
            create: {
              tone: 'friendly',
              language: 'en',
            }
          }
        },
        include: { settings: true }
      });
      
      console.log('New user created:', user);
    } else {
      // Update existing user if needed
      user = await prisma.users.update({
        where: { id: user.id },
        data: {
          username: telegramUser.username || user.username,
        },
        include: { settings: true }
      });
      
      console.log('Existing user updated:', user);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: Number(user.id),
        telegram_id: Number(user.telegram_id),
        username: user.username,
        subscription_tier: user.subscription_tier,
        subscription_expires: user.subscription_expires,
        settings: user.settings
      }
    });

  } catch (error) {
    console.error('Error in telegram-login:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
