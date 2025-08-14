'use client';

<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import LineContainer from '@/components/LineContainer';
import LineButton from '@/components/LineButton';
=======
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
>>>>>>> 1dcfe17880d6c3c99c4bdce410965f224500cc3d

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PricePlan {
  id: string;
  points: number;
  price: number;
  bonus?: string;
}

const pricePlans: PricePlan[] = [
<<<<<<< HEAD
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
=======
  { id: 'plan_1000', points: 1000, price: 1000 },
  { id: 'plan_3000', points: 3000, price: 3000, bonus: '人気!' },
  { id: 'plan_5000', points: 5000, price: 5000, bonus: 'お得!' },
];

export default function PointsPurchasePage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentBalance] = useState(1200); // This would come from API/context
>>>>>>> 1dcfe17880d6c3c99c4bdce410965f224500cc3d

  const handlePurchase = async () => {
    if (!selectedPlan) {
      alert('プランを選択してください');
      return;
    }

    setIsLoading(true);
    
<<<<<<< HEAD
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
=======
    try {
      // Create checkout session
>>>>>>> 1dcfe17880d6c3c99c4bdce410965f224500cc3d
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan,
        }),
      });

<<<<<<< HEAD
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Stripe API error:', errorData);
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

=======
>>>>>>> 1dcfe17880d6c3c99c4bdce410965f224500cc3d
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
<<<<<<< HEAD
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
=======
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">ポイント購入</h1>
          
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">現在の残高</span>
              <span className="text-3xl font-bold">{currentBalance.toLocaleString()} pt</span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-semibold text-gray-800">購入プランを選択</h2>
            
>>>>>>> 1dcfe17880d6c3c99c4bdce410965f224500cc3d
            {pricePlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPlan === plan.id
<<<<<<< HEAD
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
=======
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {plan.bonus && (
                  <span className="absolute -top-3 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {plan.bonus}
                  </span>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      selectedPlan === plan.id
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-400'
                    }`}>
                      {selectedPlan === plan.id && (
                        <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        {plan.points.toLocaleString()} pt
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">
                      ¥{plan.price.toLocaleString()}
                    </span>
                    <div className="text-sm text-gray-800">
                      (¥{(plan.price / plan.points).toFixed(1)}/pt)
>>>>>>> 1dcfe17880d6c3c99c4bdce410965f224500cc3d
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

<<<<<<< HEAD
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
=======
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">決済方法</h3>
            <div className="flex items-center space-x-2">
              <svg className="w-8 h-8" viewBox="0 0 32 32">
                <path fill="#635BFF" d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm6.5 10.5h-3c-.552 0-1 .448-1 1v1h4c.276 0 .5.224.5.5s-.224.5-.5.5h-4v6c0 .276-.224.5-.5.5s-.5-.224-.5-.5v-6h-2c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h2v-1c0-1.103.897-2 2-2h3c.276 0 .5.224.5.5s-.224.5-.5.5z"/>
              </svg>
              <span className="text-gray-800">クレジットカード決済（Stripe）</span>
            </div>
            <p className="text-xs text-gray-800 mt-2">
              安全な決済システムを使用しています
            </p>
          </div>

          <button
            onClick={handlePurchase}
            disabled={!selectedPlan || isLoading}
            className={`w-full py-4 px-6 rounded-lg font-bold text-white transition-all ${
              !selectedPlan || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
            }`}
          >
            {isLoading ? '処理中...' : '決済する'}
          </button>

          <p className="text-xs text-gray-800 text-center mt-4">
>>>>>>> 1dcfe17880d6c3c99c4bdce410965f224500cc3d
            購入後のキャンセル・返金はできません
          </p>
        </div>
      </div>
<<<<<<< HEAD
    </LineContainer>
=======
    </div>
>>>>>>> 1dcfe17880d6c3c99c4bdce410965f224500cc3d
  );
}