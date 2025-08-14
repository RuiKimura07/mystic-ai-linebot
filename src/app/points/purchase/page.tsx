'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import LineContainer from '@/components/LineContainer';
import LineButton from '@/components/LineButton';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PricePlan {
  id: string;
  points: number;
  price: number;
  bonus?: string;
}

const pricePlans: PricePlan[] = [
  { id: 'plan_500', points: 500, price: 500 },
  { id: 'plan_1000', points: 1000, price: 980 },
  { id: 'plan_3000', points: 3000, price: 2850, bonus: '5%お得!' },
  { id: 'plan_5000', points: 5000, price: 4500, bonus: '10%お得!' },
  { id: 'plan_10000', points: 10000, price: 8500, bonus: '15%お得!' },
];

export default function PointsPurchasePage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(1200);

  useEffect(() => {
    // LocalStorageからユーザー残高を取得
    const storedAuth = localStorage.getItem('demo-auth');
    if (storedAuth) {
      const user = JSON.parse(storedAuth);
      setCurrentBalance(user.balance || 1200);
    }
  }, []);

  const handlePurchase = async () => {
    if (!selectedPlan) {
      alert('プランを選択してください');
      return;
    }

    setIsLoading(true);
    
    // デモモード：Stripe設定がない場合のモック処理
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      const plan = pricePlans.find(p => p.id === selectedPlan);
      if (plan) {
        // モック決済処理
        setTimeout(() => {
          const newBalance = currentBalance + plan.points;
          // LocalStorageのユーザー情報を更新
          const storedAuth = localStorage.getItem('demo-auth');
          if (storedAuth) {
            const user = JSON.parse(storedAuth);
            user.balance = newBalance;
            localStorage.setItem('demo-auth', JSON.stringify(user));
          }
          
          setCurrentBalance(newBalance);
          setIsLoading(false);
          alert(`購入完了！\n${plan.points}ポイントを追加しました\n新しい残高：${newBalance}ポイント`);
          router.push('/dashboard');
        }, 1500);
      }
      return;
    }
    
    try {
      // 本番モード：Stripe決済
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Stripe API error:', errorData);
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error('Stripe redirect error:', error);
          alert('決済処理中にエラーが発生しました');
        }
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('購入処理中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LineContainer>
      <div className="flex flex-col h-screen">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
          <button 
            className="mr-3 hover:bg-gray-100 p-1 rounded"
            onClick={() => router.back()}
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">ポイント購入</h1>
        </div>

        {/* 残高表示 */}
        <div className="bg-blue-500 text-white p-4 mx-4 mt-4 rounded-lg">
          <div className="text-sm opacity-90 mb-1">残高</div>
          <div className="text-2xl font-bold">{currentBalance.toLocaleString()} pt</div>
        </div>

        {/* プラン選択 */}
        <div className="flex-1 px-4 py-4">
          <div className="space-y-3">
            {pricePlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {plan.bonus && (
                  <div className="absolute -top-2 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {plan.bonus}
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === plan.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-400'
                    }`}>
                      {selectedPlan === plan.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {plan.points.toLocaleString()} pt 購入
                      </div>
                      <div className="text-sm text-gray-700">
                        {(plan.price / plan.points).toFixed(1)}円/pt
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      ¥{plan.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 決済情報 */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-sm font-semibold text-gray-800">支払い方法</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-gray-700">Visa・Mastercard・JCB・American Express</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-gray-700">Google Pay・Apple Pay</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-xs text-gray-700">安全なStripe決済システム</span>
              </div>
            </div>
          </div>
        </div>

        {/* 決済ボタン */}
        <div className="p-4 bg-white border-t border-gray-200">
          <LineButton
            variant="primary"
            onClick={handlePurchase}
            disabled={!selectedPlan || isLoading}
            className={!selectedPlan || isLoading ? "opacity-50" : ""}
          >
            {isLoading ? '処理中...' : '決済する'}
          </LineButton>
          
          <p className="text-xs text-gray-700 text-center mt-3">
            購入後のキャンセル・返金はできません
          </p>
        </div>
      </div>
    </LineContainer>
  );
}