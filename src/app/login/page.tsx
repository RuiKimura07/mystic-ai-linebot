'use client';

import { useEffect } from 'react';
import Image from 'next/image';

export default function LoginPage() {
  const handleLineLogin = () => {
    const channelId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID;
    const redirectUri = process.env.NEXT_PUBLIC_LINE_REDIRECT_URI;
    const state = Math.random().toString(36).substring(7);
    
    // Store state in sessionStorage for CSRF protection
    sessionStorage.setItem('line_auth_state', state);
    
    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${channelId}&redirect_uri=${encodeURIComponent(redirectUri!)}&state=${state}&scope=profile%20openid`;
    
    window.location.href = lineAuthUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">占いの小窓</h1>
          <p className="text-sm text-gray-600">あなたの毎日に小さな光を</p>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">ログイン</h2>
              <p className="text-sm text-gray-500">LINEアカウントでログインしてください</p>
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
              <p className="text-xs text-gray-400">
                ログインすることで利用規約とプライバシーポリシーに同意したものとみなします
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}