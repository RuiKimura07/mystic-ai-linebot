import { NextResponse } from 'next/server';

export async function GET() {
  // 環境変数の設定状況を返す（値は表示しない）
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    hasLineLoginChannelId: !!process.env.NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID,
    hasLineLoginSecret: !!process.env.LINE_LOGIN_CHANNEL_SECRET,
    hasLineRedirectUri: !!process.env.NEXT_PUBLIC_LINE_REDIRECT_URI,
    hasMessagingSecret: !!process.env.LINE_MESSAGING_CHANNEL_SECRET,
    hasMessagingToken: !!process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
    // 後方互換性チェック
    hasOldChannelId: !!process.env.NEXT_PUBLIC_LINE_CHANNEL_ID,
    hasOldChannelSecret: !!process.env.LINE_CHANNEL_SECRET,
    hasOldAccessToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
  });
}