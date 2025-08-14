'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LineContainer from '@/components/LineContainer';
import LineButton from '@/components/LineButton';

function PurchaseSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [purchaseDetails, setPurchaseDetails] = useState<any>(null);

  useEffect(() => {
    const verifyPurchase = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        router.push('/points/purchase');
        return;
      }

      try {
        // 購入確認API呼び出し（実装要）
        // const response = await fetch(`/api/stripe/verify-purchase?session_id=${sessionId}`);
        // const data = await response.json();
        
        // デモ用データ
        setPurchaseDetails({
          points: 3000,
          amount: 2850,
          date: new Date().toLocaleString('ja-JP'),
        });

        // LocalStorageの残高を更新（デモ用）
        const storedAuth = localStorage.getItem('demo-auth');
        if (storedAuth) {
          const userData = JSON.parse(storedAuth);
          userData.balance = (userData.balance || 0) + 3000;
          localStorage.setItem('demo-auth', JSON.stringify(userData));
        }

      } catch (error) {
        console.error('Purchase verification error:', error);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPurchase();
  }, [searchParams, router]);

  if (isVerifying) {
    return (
      <LineContainer>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4 mx-auto"></div>
            <p className="text-gray-700">購入を確認中...</p>
          </div>
        </div>
      </LineContainer>
    );
  }

  return (
    <LineContainer>
      <div className="flex flex-col h-screen">
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            {/* 成功アイコン */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              購入完了！
            </h1>
            
            {purchaseDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-lg font-bold text-blue-600 mb-2">
                  +{purchaseDetails.points?.toLocaleString()} pt
                </div>
                <div className="text-sm text-gray-700">
                  <div>決済金額: ¥{purchaseDetails.amount?.toLocaleString()}</div>
                  <div className="mt-1">{purchaseDetails.date}</div>
                </div>
              </div>
            )}

            <p className="text-gray-700 mb-8">
              ポイントが追加されました。<br />
              占いチャットをお楽しみください！
            </p>

            <div className="space-y-3">
              <LineButton
                variant="primary"
                onClick={() => router.push('/chat')}
              >
                占いチャットを開始
              </LineButton>
              
              <LineButton
                variant="secondary"
                onClick={() => router.push('/dashboard')}
              >
                マイページへ戻る
              </LineButton>
            </div>
          </div>
        </div>
      </div>
    </LineContainer>
  );
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={
      <LineContainer>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4 mx-auto"></div>
            <p className="text-gray-700">読み込み中...</p>
          </div>
        </div>
      </LineContainer>
    }>
      <PurchaseSuccessContent />
    </Suspense>
  );
}