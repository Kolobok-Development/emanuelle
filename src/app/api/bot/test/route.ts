import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Test the HTML formatting that will be sent to Telegram
  const testResponse = `🤖 <b>Emanuelle</b>

Hello there! I'm Emanuelle, your friendly AI companion. I'm here to help you with everyday conversations and tasks. What would you like to talk about today?

💬 Friendly, helpful, and always ready to chat
⚡ Energy cost: 5`;

  return NextResponse.json({
    message: "Test response formatted for Telegram",
    formattedResponse: testResponse,
    htmlTags: ["<b>", "</b>"],
    note: "Only <b> tags are used - Telegram supports these"
  });
}
