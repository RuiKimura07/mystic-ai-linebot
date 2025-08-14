import { NextRequest, NextResponse } from 'next/server';
import { sendPushMessage } from '@/lib/line';

interface ChatCompleteData {
  userId: string;
  lineUserId: string;
  fortuneTellerName: string;
  chatType: string;
  duration: number; // 秒
  pointsUsed: number;
  chatId: string;
}

export async function POST(request: NextRequest) {
  try {
    const chatData: ChatCompleteData = await request.json();
    
    const {
      userId,
      lineUserId,
      fortuneTellerName,
      chatType,
      duration,
      pointsUsed,
      chatId
    } = chatData;

    // データベースにチャット履歴を保存（要実装）
    // await saveChatHistory(chatData);

    // ポイント残高を減算（要実装）
    // await deductUserPoints(userId, pointsUsed);

    // LINE通知送信
    const durationMinutes = Math.ceil(duration / 60);
    
    const messages = [
      {
        type: 'text',
        text: `🔮 占いチャット完了\n\n👤 ${fortuneTellerName}\n📝 ${chatType}\n⏰ ${durationMinutes}分間\n💰 消費ポイント: ${pointsUsed}pt\n\nありがとうございました！\nまたのご利用をお待ちしております。`
      },
      {
        type: 'template',
        altText: 'チャット完了メニュー',
        template: {
          type: 'buttons',
          text: '他にもサービスをご利用いただけます',
          actions: [
            {
              type: 'uri',
              label: '📊 履歴確認',
              uri: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
            },
            {
              type: 'uri',
              label: '🔮 もう一度占う',
              uri: `${process.env.NEXT_PUBLIC_APP_URL}/chat`
            },
            {
              type: 'uri',
              label: '💳 ポイント購入',
              uri: `${process.env.NEXT_PUBLIC_APP_URL}/points/purchase`
            }
          ]
        }
      }
    ];

    await sendPushMessage(lineUserId, messages);

    return NextResponse.json({ 
      success: true, 
      message: 'Chat completion notification sent' 
    });

  } catch (error) {
    console.error('Chat complete notification error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat completion' },
      { status: 500 }
    );
  }
}