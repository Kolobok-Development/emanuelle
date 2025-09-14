import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt, COOKIE_NAME } from '@/utils/sessions';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    // Verify JWT and check if session exists in database
    try {
      await decrypt(token);
    } catch {
      return NextResponse.json(
        { error: 'Invalid session token' },
        { status: 401 }
      );
    }

    // Check if session exists in database and is not expired
    const session = await prisma.session.findFirstOrThrow({
      where: { token },
      include: { user: { include: { settings: true } } }
    });

    if (!session || session.expires_at < new Date()) {
      return NextResponse.json(
        { error: 'Session expired or not found' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        telegram_id: Number(session.user.telegram_id),
        username: session.user.username,
        subscription_tier: session.user.subscription_tier,
        subscription_expires: session.user.subscription_expires,
        settings: session.user.settings
      },
      session: {
        expires_at: session.expires_at
      }
    });

  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
