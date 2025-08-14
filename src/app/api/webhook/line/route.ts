import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { replyMessage } from '@/lib/line';

interface LineWebhookEvent {
  type: string;
  source: {
    type: string;
    userId?: string;
  };
  message?: {
    type: string;
    text?: string;
  };
  replyToken?: string;
  timestamp: number;
}

interface LineWebhookBody {
  destination: string;
  events: LineWebhookEvent[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-line-signature');
    
    // 1. Webhook署名検証
    if (!verifySignature(body, signature)) {
      console.error('Invalid LINE webhook signature');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const webhookData: LineWebhookBody = JSON.parse(body);
    
    // 2. イベント処理
    for (const event of webhookData.events) {
      await handleLineEvent(event);
    }

    return NextResponse.json({ message: 'OK' }, { status: 200 });
  } catch (error) {
    console.error('LINE webhook error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// 署名検証関数（Messaging API用）
function verifySignature(body: string, signature: string | null): boolean {
  const channelSecret = process.env.LINE_MESSAGING_CHANNEL_SECRET || process.env.LINE_CHANNEL_SECRET;
  
  if (!channelSecret || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('SHA256', channelSecret)
    .update(body, 'utf8')
    .digest('base64');

  return signature === `SHA256=${expectedSignature}`;
}

// LINEイベント処理
async function handleLineEvent(event: LineWebhookEvent) {
  const { type, source, replyToken } = event;

  // ユーザーからのメッセージの場合のみ処理
  if (type !== 'message' || !source.userId || !replyToken) {
    return;
  }

  try {
    switch (event.message?.type) {
      case 'text':
        await handleTextMessage(event, replyToken, source.userId);
        break;
      
      default:
        await replyMessage(replyToken, [{
          type: 'text',
          text: '申し訳ございませんが、テキストメッセージのみ対応しております。'
        }]);
    }
  } catch (error) {
    console.error('Event handling error:', error);
  }
}

// テキストメッセージ処理
async function handleTextMessage(event: LineWebhookEvent, replyToken: string, userId: string) {
  const messageText = event.message?.text?.toLowerCase() || '';

  // メニューキーワード判定
  if (messageText.includes('メニュー') || messageText.includes('ヘルプ') || messageText === 'menu') {
    await replyWithMainMenu(replyToken);
  } else if (messageText.includes('ポイント') || messageText.includes('購入')) {
    await replyWithPointsInfo(replyToken);
  } else if (messageText.includes('占い') || messageText.includes('相談')) {
    await replyWithFortuneTellerMenu(replyToken);
  } else if (messageText.includes('残高') || messageText.includes('balance')) {
    await replyWithBalanceInfo(replyToken, userId);
  } else {
    // デフォルトレスポンス
    await replyWithMainMenu(replyToken);
  }
}

// メインメニュー表示
async function replyWithMainMenu(replyToken: string) {
  const messages = [
    {
      type: 'text',
      text: '🔮 占いの小窓へようこそ！\n\n以下のメニューからお選びください：'
    },
    {
      type: 'template',
      altText: 'サービスメニュー',
      template: {
        type: 'buttons',
        text: 'ご利用になりたいサービスをお選びください',
        actions: [
          {
            type: 'uri',
            label: '🔮 占いチャット',
            uri: `${process.env.NEXT_PUBLIC_APP_URL}/chat`
          },
          {
            type: 'uri',
            label: '💳 ポイント購入',
            uri: `${process.env.NEXT_PUBLIC_APP_URL}/points/purchase`
          },
          {
            type: 'uri',
            label: '📊 マイページ',
            uri: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
          },
          {
            type: 'postback',
            label: '💰 残高確認',
            data: 'action=check_balance'
          }
        ]
      }
    }
  ];

  await replyMessage(replyToken, messages);
}

// ポイント情報表示
async function replyWithPointsInfo(replyToken: string) {
  const message = {
    type: 'text',
    text: `💳 ポイント購入について\n\n📍 料金プラン：\n• 500pt - ¥500\n• 1,000pt - ¥980（2%お得）\n• 3,000pt - ¥2,850（5%お得）\n• 5,000pt - ¥4,500（10%お得）\n• 10,000pt - ¥8,500（15%お得）\n\n💰 占いチャット料金：\n• 恋愛相談：20pt/分\n• 仕事・キャリア：25pt/分\n• 健康・家族：18pt/分\n• 金運・投資：30pt/分\n\n購入はこちら👇\n${process.env.NEXT_PUBLIC_APP_URL}/points/purchase`
  };

  await replyMessage(replyToken, [message]);
}

// 占い師メニュー表示
async function replyWithFortuneTellerMenu(replyToken: string) {
  const message = {
    type: 'template',
    altText: '占い師一覧',
    template: {
      type: 'carousel',
      columns: [
        {
          text: '桜井先生\n恋愛・人間関係\n経験15年 ⭐4.8\n20pt/分',
          actions: [
            {
              type: 'uri',
              label: 'チャット開始',
              uri: `${process.env.NEXT_PUBLIC_APP_URL}/chat`
            }
          ]
        },
        {
          text: '田中先生\n仕事・キャリア\n経験12年 ⭐4.6\n25pt/分',
          actions: [
            {
              type: 'uri',
              label: 'チャット開始',
              uri: `${process.env.NEXT_PUBLIC_APP_URL}/chat`
            }
          ]
        },
        {
          text: '佐藤先生\n金運・投資\n経験8年 ⭐4.4\n30pt/分',
          actions: [
            {
              type: 'uri',
              label: 'チャット開始',
              uri: `${process.env.NEXT_PUBLIC_APP_URL}/chat`
            }
          ]
        }
      ]
    }
  };

  await replyMessage(replyToken, [message]);
}

// 残高情報表示
async function replyWithBalanceInfo(replyToken: string, userId: string) {
  // TODO: データベースからユーザーの実際の残高を取得
  // const userBalance = await getUserBalance(userId);
  const userBalance = 1200; // デモ用

  const message = {
    type: 'text',
    text: `💰 残高情報\n\n現在の残高: ${userBalance.toLocaleString()}pt\n\nポイントが不足している場合は\n下記から購入できます👇\n${process.env.NEXT_PUBLIC_APP_URL}/points/purchase`
  };

  await replyMessage(replyToken, [message]);
}

