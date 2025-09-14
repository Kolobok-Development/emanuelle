import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clearSessionCookie, COOKIE_NAME } from '@/utils/sessions';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    
    if (token) {
      // Delete session from database
      try {
        await prisma.session.delete({ where: { token } });
      } catch {
        // Ignore if session not found
      }
    }

    const res = NextResponse.json({ success: true });
    
    // Clear session cookie
    const cookieData = clearSessionCookie();
    res.cookies.set(cookieData);

    return res;

  } catch (error) {
    console.error('Error in /api/auth/logout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



