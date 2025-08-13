'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PricePlan {
  id: string;
  points: number;
  price: number;
  bonus?: string;
}

const pricePlans: PricePlan[] = [
  { id: 'plan_1000', points: 1000, price: 1000 },
  { id: 'plan_3000', points: 3000, price: 3000, bonus: '人気!' },
  { id: 'plan_5000', points: 5000, price: 5000, bonus: 'お得!' },
];

export default function PointsPurchasePage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentBalance] = useState(1200); // This would come from API/context

  const handlePurchase = async () => {
    if (!selectedPlan) {
      alert('プランを選択してください');
      return;
    }

    setIsLoading(true);
    
    try {
      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan,
        }),
      });

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
            
            {pricePlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPlan === plan.id
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
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
            購入後のキャンセル・返金はできません
          </p>
        </div>
      </div>
    </div>
  );
}