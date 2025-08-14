'use client';

import { useEffect } from 'react';
<<<<<<< HEAD
import LineContainer from '@/components/LineContainer';
import LineButton from '@/components/LineButton';

export default function LoginPage() {
  const handleLineLogin = () => {
    const channelId = process.env.NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID || process.env.NEXT_PUBLIC_LINE_CHANNEL_ID;
    const redirectUri = process.env.NEXT_PUBLIC_LINE_REDIRECT_URI;
    
    // デバッグログ
    console.log('Channel ID:', channelId ? 'Set' : 'Not set');
    console.log('Redirect URI:', redirectUri ? 'Set' : 'Not set');
    
    if (!channelId || !redirectUri) {
      console.warn('LINE環境変数が設定されていません - デモモードで実行');
      alert('LINE環境変数が設定されていません。render.comで環境変数を確認してください。');
      handleDemoLogin();
      return;
    }
    
=======
import Image from 'next/image';

export default function LoginPage() {
  const handleLineLogin = () => {
    const channelId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID;
    const redirectUri = process.env.NEXT_PUBLIC_LINE_REDIRECT_URI;
>>>>>>> 1dcfe17880d6c3c99c4bdce410965f224500cc3d
    const state = Math.random().toString(36).substring(7);
    
    // Store state in sessionStorage for CSRF protection
    sessionStorage.setItem('line_auth_state', state);
    
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${channelId}&redirect_uri=${encodeURIComponent(redirectUri!)}&state=${state}&scope=profile%20openid`;
    
<<<<<<< HEAD
    console.log('Generated LINE Auth URL:', lineAuthUrl);
    console.log('State saved:', state);
    
    window.location.href = lineAuthUrl;
  };

  const handleDemoLogin = () => {
    // デモモード：モックユーザーでログイン
    const mockUser = {
      id: 'demo-user-001',
      name: '山田太郎',
      email: 'demo@example.com',
      pictureUrl: '',
      role: 'user' as const,
      balance: 1200,
    };
    
    localStorage.setItem('demo-auth', JSON.stringify(mockUser));
    window.location.href = '/dashboard';
  };

  return (
    <LineContainer>
      <div className="flex flex-col h-screen">
        {/* ヘッダー */}
        <div className="text-center py-8 px-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">占いの小窓</h1>
          <p className="text-sm text-gray-700">あなたの毎日に小さな光を</p>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 px-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">占い師とチャット</h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                経験豊富な占い師があなたの悩みにお答えします。<br />
                恋愛・仕事・人間関係などお気軽にご相談ください。
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>24時間いつでも相談可能</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>1回500ポイントから利用可能</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>プライバシー完全保護</span>
              </div>
            </div>
          </div>

          <LineButton 
            variant="line" 
            onClick={handleLineLogin}
            className="mb-4"
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              <span>LINEでログイン</span>
            </div>
          </LineButton>

          <p className="text-xs text-gray-700 text-center px-4 leading-relaxed">
            ログインすることで利用規約とプライバシーポリシーに同意したものとみなします
          </p>

          {/* デモモード表示 */}
          {!process.env.NEXT_PUBLIC_LINE_CHANNEL_ID && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-700 text-center">
                デモモード：LINEログインボタンをクリックするとデモユーザーでログインします
              </p>
            </div>
          )}
        </div>
      </div>
    </LineContainer>
=======
    window.location.href = lineAuthUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">占いの小窓</h1>
          <p className="text-sm text-gray-700">あなたの毎日に小さな光を</p>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">ログイン</h2>
              <p className="text-sm text-gray-800">LINEアカウントでログインしてください</p>
            </div>
            
            <button
              onClick={handleLineLogin}
              className="w-full bg-[#00B900] hover:bg-[#00A000] text-white font-bold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              <span>LINEでログイン</span>
            </button>
            
            <div className="text-center">
              <p className="text-xs text-gray-800">
                ログインすることで利用規約とプライバシーポリシーに同意したものとみなします
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
>>>>>>> 1dcfe17880d6c3c99c4bdce410965f224500cc3d
  );
}