'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LineContainer from '@/components/LineContainer';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URLパラメータからcodeとstateを取得
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // デバッグ情報
        console.log('Callback parameters:');
        console.log('- code:', code ? 'present' : 'missing');
        console.log('- state:', state ? 'present' : 'missing');
        console.log('- error:', error);
        console.log('- full URL:', window.location.href);

        // エラーレスポンスのチェック
        if (error) {
          throw new Error(`LINE認証エラー: ${error}`);
        }

        // 必要なパラメータの存在確認
        if (!code || !state) {
          console.error('Missing required parameters:', { code, state });
          throw new Error(`認証パラメータが不正です (code: ${code ? '有' : '無'}, state: ${state ? '有' : '無'})`);
        }

        // sessionStorageからstateを取得してCSRF検証
        const storedState = sessionStorage.getItem('line_auth_state');
        if (!storedState || storedState !== state) {
          throw new Error('不正なリクエストです（CSRF検証失敗）');
        }

        // state情報をクリーンアップ
        sessionStorage.removeItem('line_auth_state');

        // バックエンドAPIでトークン交換とユーザー情報取得
        const response = await fetch('/api/auth/line', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '認証処理でエラーが発生しました');
        }

        const { token, user } = await response.json();

        // JWTトークンをLocalStorageに保存（本番ではhttpOnlyクッキー推奨）
        localStorage.setItem('auth-token', token);
        localStorage.setItem('user-data', JSON.stringify(user));

        setStatus('success');

        // ダッシュボードへリダイレクト
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);

      } catch (error) {
        console.error('認証コールバックエラー:', error);
        setErrorMessage(error instanceof Error ? error.message : '認証に失敗しました');
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <LineContainer>
      <div className="flex flex-col items-center justify-center h-screen px-6">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">認証中...</h2>
            <p className="text-gray-700">LINE認証を処理しています</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">認証完了！</h2>
            <p className="text-gray-700">ダッシュボードに移動します...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">認証エラー</h2>
            <p className="text-red-600 mb-4">{errorMessage}</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ログイン画面に戻る
            </button>
          </div>
        )}
      </div>
    </LineContainer>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <LineContainer>
        <div className="flex flex-col items-center justify-center h-screen px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">読み込み中...</h2>
            <p className="text-gray-700">認証情報を処理しています</p>
          </div>
        </div>
      </LineContainer>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}