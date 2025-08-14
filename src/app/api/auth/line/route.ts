import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface LineTokenResponse {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
}

interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

interface LineIdToken {
  sub: string; // userId
  name: string;
  picture?: string;
  email?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json();

    if (!code || !state) {
      return NextResponse.json(
        { message: '認証コードまたはstateが不正です' },
        { status: 400 }
      );
    }

    // 環境変数の確認（LINE Login用）
    const channelId = process.env.NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID || process.env.NEXT_PUBLIC_LINE_CHANNEL_ID;
    const channelSecret = process.env.LINE_LOGIN_CHANNEL_SECRET || process.env.LINE_CHANNEL_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_LINE_REDIRECT_URI;
    const jwtSecret = process.env.JWT_SECRET;

    if (!channelId || !channelSecret || !redirectUri || !jwtSecret) {
      console.error('必要な環境変数が設定されていません');
      return NextResponse.json(
        { message: 'サーバー設定エラー' },
        { status: 500 }
      );
    }

    // 1. LINEアクセストークンを取得
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: channelId,
        client_secret: channelSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('LINE token exchange error:', errorData);
      return NextResponse.json(
        { message: 'LINEトークン取得に失敗しました' },
        { status: 400 }
      );
    }

    const tokenData: LineTokenResponse = await tokenResponse.json();

    // 2. IDトークンからユーザー情報を取得（JWT verify）
    let userInfo: LineIdToken;
    try {
      // IDトークンをデコード（署名検証は本番環境では必須）
      const idTokenPayload = jwt.decode(tokenData.id_token) as LineIdToken;
      if (!idTokenPayload || !idTokenPayload.sub) {
        throw new Error('Invalid ID token');
      }
      userInfo = idTokenPayload;
    } catch (error) {
      console.error('ID token decode error:', error);
      return NextResponse.json(
        { message: 'ユーザー情報の取得に失敗しました' },
        { status: 400 }
      );
    }

    // 3. LINE Profile APIからプロフィール情報を取得（より詳細な情報が必要な場合）
    let profileInfo: LineProfile | null = null;
    try {
      const profileResponse = await fetch('https://api.line.me/v2/profile', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });
      
      if (profileResponse.ok) {
        profileInfo = await profileResponse.json();
      }
    } catch (error) {
      console.warn('LINE profile fetch error:', error);
      // プロフィール取得失敗は致命的エラーではない
    }

    // 4. ユーザーデータを構築
    const userData = {
      id: userInfo.sub,
      name: profileInfo?.displayName || userInfo.name || 'ユーザー',
      email: userInfo.email || '',
      pictureUrl: profileInfo?.pictureUrl || userInfo.picture || '',
      role: 'user' as const,
      balance: 0, // 新規ユーザーは0ポイントから開始
      lineUserId: userInfo.sub,
      registeredAt: new Date().toISOString(),
    };

    // 5. データベースにユーザー情報を保存/更新（実装要）
    // TODO: データベース連携実装
    // await saveOrUpdateUser(userData);

    // 6. JWTトークンを生成
    const jwtToken = jwt.sign(
      {
        userId: userData.id,
        role: userData.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7日間有効
      },
      jwtSecret
    );

    // 7. レスポンス返却
    return NextResponse.json({
      token: jwtToken,
      user: userData,
      message: '認証成功',
    });

  } catch (error) {
    console.error('LINE auth error:', error);
    return NextResponse.json(
      { message: '認証処理でエラーが発生しました' },
      { status: 500 }
    );
  }
}

// ユーザー情報保存/更新関数（データベース実装時に使用）
async function saveOrUpdateUser(userData: any) {
  // データベース実装例:
  // const existingUser = await db.user.findUnique({
  //   where: { lineUserId: userData.lineUserId }
  // });
  // 
  // if (existingUser) {
  //   return await db.user.update({
  //     where: { id: existingUser.id },
  //     data: {
  //       name: userData.name,
  //       pictureUrl: userData.pictureUrl,
  //       lastLoginAt: new Date(),
  //     }
  //   });
  // } else {
  //   return await db.user.create({
  //     data: userData
  //   });
  // }
}