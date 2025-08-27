import { NextResponse } from 'next/server';
import { aiResponseQueue } from '@/lib/queues/ai-response-queue';

export async function GET() {
  try {
    // Get queue status
    const waiting = await aiResponseQueue.getWaiting();
    const active = await aiResponseQueue.getActive();
    const completed = await aiResponseQueue.getCompleted();
    const failed = await aiResponseQueue.getFailed();
    
    // Get queue counts
    const waitingCount = await aiResponseQueue.count();
    const activeCount = active.length;
    const completedCount = completed.length;
    const failedCount = failed.length;
    
    return NextResponse.json({
      success: true,
      queue: 'ai-response',
      status: {
        waiting: waitingCount,
        active: activeCount,
        completed: completedCount,
        failed: failedCount
      },
      details: {
        waiting: waiting.map(job => ({ id: job.id, data: job.data })),
        active: active.map(job => ({ id: job.id, data: job.data })),
        completed: completed.slice(-5).map(job => ({ id: job.id, result: job.returnvalue })),
        failed: failed.slice(-5).map(job => ({ id: job.id, error: job.failedReason }))
      }
    });
    
  } catch (error) {
    console.error('Test queue error:', error);
    return NextResponse.json({ 
      error: 'Failed to test queue',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Add a test job to the queue
    const testJob = await aiResponseQueue.add('test-job', {
      chatId: 12345,
      userMessage: 'This is a test message',
      companion: {
        id: 'emanuelle',
        name: 'Emanuelle',
        avatar: '🤖',
        personality: 'Friendly, helpful, and always ready to chat',
        energyCost: 5
      },
      username: 'testuser',
      messageId: 999
    }, {
      priority: 1,
      delay: 0,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Test job added to queue',
      jobId: testJob.id,
      queue: 'ai-response'
    });
    
  } catch (error) {
    console.error('Test job creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create test job',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
