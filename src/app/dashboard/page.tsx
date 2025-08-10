'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Transaction {
  id: string;
  type: 'purchase' | 'usage';
  amount: number;
  description: string;
  date: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [currentBalance] = useState(1200);
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'purchase',
      amount: 3000,
      description: 'ポイント購入',
      date: '2025/08/10',
    },
    {
      id: '2',
      type: 'usage',
      amount: -500,
      description: '占いチャット',
      date: '2025/08/09',
    },
    {
      id: '3',
      type: 'purchase',
      amount: 1000,
      description: 'ポイント購入',
      date: '2025/08/08',
    },
  ]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">マイページ</h1>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ログアウト
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">ポイント残高</h2>
              <div className="text-4xl font-bold mb-4">
                {currentBalance.toLocaleString()} pt
              </div>
              <Link
                href="/points/purchase"
                className="inline-block bg-white text-purple-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ポイント購入
              </Link>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">今月の利用</h2>
              <div className="text-4xl font-bold mb-4">
                500 pt
              </div>
              <div className="text-sm opacity-90">
                チャット回数: 2回
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">取引履歴</h2>
            
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white rounded-lg p-4 flex justify-between items-center"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'purchase'
                        ? 'bg-green-100'
                        : 'bg-red-100'
                    }`}>
                      {transaction.type === 'purchase' ? (
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {transaction.description}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.date}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${
                    transaction.type === 'purchase'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'purchase' ? '+' : ''}
                    {transaction.amount.toLocaleString()} pt
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 text-center text-purple-600 hover:text-purple-700 font-semibold">
              もっと見る
            </button>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <Link
              href="/chat"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center font-bold py-4 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              占いチャットを始める
            </Link>
            <Link
              href="/settings"
              className="bg-gray-200 text-gray-800 text-center font-bold py-4 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              設定
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}