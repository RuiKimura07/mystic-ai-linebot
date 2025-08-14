// LINE Messaging API ユーティリティ関数

// プッシュメッセージ送信（通知用）
export async function sendPushMessage(userId: string, messages: any[]) {
  const channelAccessToken = process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN || process.env.LINE_CHANNEL_ACCESS_TOKEN;
  
  if (!channelAccessToken) {
    console.error('LINE_CHANNEL_ACCESS_TOKEN not set');
    return;
  }

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelAccessToken}`
      },
      body: JSON.stringify({
        to: userId,
        messages: messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('LINE push message error:', errorData);
    }
  } catch (error) {
    console.error('Failed to send push message:', error);
  }
}

// リプライメッセージ送信
export async function replyMessage(replyToken: string, messages: any[]) {
  const channelAccessToken = process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN || process.env.LINE_CHANNEL_ACCESS_TOKEN;
  
  if (!channelAccessToken) {
    console.error('LINE_CHANNEL_ACCESS_TOKEN not set');
    return;
  }

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelAccessToken}`
      },
      body: JSON.stringify({
        replyToken: replyToken,
        messages: messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('LINE reply message error:', errorData);
    }
  } catch (error) {
    console.error('Failed to send reply message:', error);
  }
}