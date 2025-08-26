import { NextResponse } from 'next/server';
import generateMessage from '@/utils/services/ai/generateMessage';

export async function GET() {
  try {
    // Check environment variables
    const modelslabKey = process.env.MODELSLAB_KEY;
    
    if (!modelslabKey) {
      return NextResponse.json({
        error: 'MODELSLAB_KEY not found in environment variables',
        envVars: Object.keys(process.env).filter(key => key.includes('MODEL'))
      }, { status: 500 });
    }

    // Test with a simple message
    const testMessages = [
      {
        role: "system",
        content: "You are Emanuelle, a friendly AI companion. Respond briefly and cheerfully."
      },
      {
        role: "user",
        content: "Hello! How are you today?"
      }
    ];

    console.log('Testing AI service with messages:', JSON.stringify(testMessages, null, 2));
    console.log('Using API key:', modelslabKey.substring(0, 10) + '...');

    // Call the AI service
    const aiResponse = await generateMessage(testMessages);
    
    console.log('AI service response:', JSON.stringify(aiResponse, null, 2));

    return NextResponse.json({
      success: true,
      environment: {
        MODELSLAB_KEY: modelslabKey ? 'Set' : 'Not set',
        keyPreview: modelslabKey ? modelslabKey.substring(0, 10) + '...' : 'N/A'
      },
      testMessages: testMessages,
      aiResponse: aiResponse,
      responseType: typeof aiResponse,
      hasChoices: aiResponse?.choices ? 'Yes' : 'No',
      choicesCount: aiResponse?.choices?.length || 0
    });

  } catch (error) {
    console.error('Debug AI error:', error);
    return NextResponse.json({ 
      error: 'Failed to debug AI service',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
