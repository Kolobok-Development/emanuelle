import { NextResponse } from 'next/server';
import { AICompanionService } from '@/lib/ai-companions';

export async function GET() {
  try {
    const companions = await AICompanionService.getAllCompanions();
    return NextResponse.json({ companions });
  } catch (error) {
    console.error('Error fetching AI companions:', error);
    return NextResponse.json({ error: 'Failed to fetch companions' }, { status: 500 });
  }
}
