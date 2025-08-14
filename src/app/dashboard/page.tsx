'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LineContainer from '@/components/LineContainer';
import LineButton from '@/components/LineButton';

interface Transaction {
  id: string;
  type: 'purchase' | 'usage' | 'bonus';
  amount: number;
  description: string;
  date: string;
  paymentMethod?: string;
  chatType?: string;
  fortuneTellerName?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  totalPurchased: number;
  totalUsed: number;
  membershipLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  registeredAt: string;
}

interface ChatHistory {
  id: string;
  fortuneTellerName: string;
  chatType: string;
  duration: number;
  pointsUsed: number;
  date: string;
  rating?: number;
  satisfaction: 'excellent' | 'good' | 'average' | 'poor';
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'profile'>('overview');
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'purchase',
      amount: 3000,
      description: 'ポイント購入',
      date: '2025/08/10 15:30',
      paymentMethod: 'Visa ****1234'
    },
    {
      id: '2',
      type: 'usage',
      amount: -500,
      description: '恋愛相談チャット',
      date: '2025/08/10 14:15',
      chatType: '恋愛相談',
      fortuneTellerName: '桜井先生'
    },
    {
      id: '3',
      type: 'usage',
      amount: -300,
      description: '仕事運チャット',
      date: '2025/08/09 20:30',
      chatType: '仕事運',
      fortuneTellerName: '田中先生'
    },
    {
      id: '4',
      type: 'purchase',
      amount: 1000,
      description: 'ポイント購入',
      date: '2025/08/08 12:45',
      paymentMethod: 'JCB ****5678'
    },
    {
      id: '5',
      type: 'bonus',
      amount: 100,
      description: '新規登録ボーナス',
      date: '2025/08/01 10:00'
    },
    {
      id: '6',
      type: 'usage',
      amount: -200,
      description: '健康運チャット',
      date: '2025/08/07 16:20',
      chatType: '健康運',
      fortuneTellerName: '山田先生'
    }
  ]);

  const [chatHistory] = useState<ChatHistory[]>([
    {
      id: '1',
      fortuneTellerName: '桜井先生',
      chatType: '恋愛相談',
      duration: 25,
      pointsUsed: 500,
      date: '2025/08/10 14:15',
      rating: 5,
      satisfaction: 'excellent'
    },
    {
      id: '2',
      fortuneTellerName: '田中先生',
      chatType: '仕事運',
      duration: 18,
      pointsUsed: 300,
      date: '2025/08/09 20:30',
      rating: 4,
      satisfaction: 'good'
    },
    {
      id: '3',
      fortuneTellerName: '山田先生',
      chatType: '健康運',
      duration: 12,
      pointsUsed: 200,
      date: '2025/08/07 16:20',
      rating: 5,
      satisfaction: 'excellent'
    }
  ]);

  useEffect(() => {
    // LocalStorageからユーザー情報を取得、なければデモデータを使用
    const storedAuth = localStorage.getItem('demo-auth');
    let userData: any = {};
    
    if (storedAuth) {
      try {
        userData = JSON.parse(storedAuth);
      } catch (e) {
        console.error('Failed to parse stored auth data:', e);
        userData = {};
      }
    }

    // デフォルトのデモユーザーデータを設定
    const defaultUser = {
      id: 'demo-user-001',
      name: '山田太郎',
      email: 'demo@example.com',
      balance: 1200,
      totalPurchased: 5000,
      totalUsed: 1000,
      membershipLevel: 'silver' as const,
      registeredAt: '2025/08/01'
    };

    const userBalance = userData.balance || defaultUser.balance;
    const finalUser = {
      ...defaultUser,
      ...userData,
      membershipLevel: userBalance > 5000 ? 'gold' as const : 
                       userBalance > 2000 ? 'silver' as const : 'bronze' as const
    };

    // デモ用認証情報がない場合は保存
    if (!storedAuth) {
      localStorage.setItem('demo-auth', JSON.stringify(finalUser));
    }

    setUser(finalUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('demo-auth');
    router.push('/login');
  };

  const getMembershipBadge = (level: string) => {
    const badges = {
      bronze: { color: 'bg-amber-100 text-amber-800', label: 'ブロンズ' },
      silver: { color: 'bg-gray-100 text-gray-800', label: 'シルバー' },
      gold: { color: 'bg-yellow-100 text-yellow-800', label: 'ゴールド' },
      platinum: { color: 'bg-purple-100 text-purple-800', label: 'プラチナ' }
    };
    return badges[level as keyof typeof badges] || badges.bronze;
  };

  const getThisMonthStats = () => {
    const thisMonth = transactions.filter(t => t.date.includes('2025/08'));
    const totalUsed = thisMonth.filter(t => t.type === 'usage').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const chatCount = thisMonth.filter(t => t.type === 'usage').length;
    return { totalUsed, chatCount };
  };

  const thisMonthStats = getThisMonthStats();

  if (!user) {
    return (
      <LineContainer>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-700">読み込み中...</p>
          </div>
        </div>
      </LineContainer>
    );
  }

  return (
    <LineContainer>
      <div className="flex flex-col h-screen">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-bold text-gray-900">マイページ</h1>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getMembershipBadge(user.membershipLevel).color}`}>
                {getMembershipBadge(user.membershipLevel).label}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-700 text-sm hover:text-gray-900"
            >
              ログアウト
            </button>
          </div>
          <p className="text-sm text-gray-700 mt-1">ようこそ、{user.name}さん</p>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white border-b border-gray-200 px-4">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 text-sm font-medium border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-700 hover:text-gray-700'
              }`}
            >
              概要
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 text-sm font-medium border-b-2 ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-700 hover:text-gray-700'
              }`}
            >
              履歴
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 text-sm font-medium border-b-2 ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-700 hover:text-gray-700'
              }`}
            >
              プロフィール
            </button>
          </div>
        </div>

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="p-4 space-y-4">
              {/* 残高表示 */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm opacity-90 mb-1">現在の残高</div>
                    <div className="text-3xl font-bold">{user.balance.toLocaleString()} pt</div>
                  </div>
                  <div className="text-right">
                    <svg className="w-10 h-10 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 統計カード */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="text-green-600 text-sm mb-1">今月の利用</div>
                  <div className="text-xl font-bold text-green-800">{thisMonthStats.totalUsed} pt</div>
                  <div className="text-xs text-green-600 mt-1">{thisMonthStats.chatCount}回のチャット</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <div className="text-purple-600 text-sm mb-1">累計利用</div>
                  <div className="text-xl font-bold text-purple-800">{user.totalUsed.toLocaleString()} pt</div>
                  <div className="text-xs text-purple-600 mt-1">登録から{chatHistory.length + 5}回</div>
                </div>
              </div>

              {/* 最近のチャット履歴 */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-gray-900">最近のチャット</h3>
                  <button
                    onClick={() => setShowChatHistory(true)}
                    className="text-blue-600 text-sm hover:text-blue-800"
                  >
                    すべて見る
                  </button>
                </div>
                <div className="space-y-3">
                  {chatHistory.slice(0, 3).map((chat) => (
                    <div key={chat.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{chat.fortuneTellerName}</div>
                            <div className="text-xs text-gray-700">{chat.chatType} • {chat.duration}分</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-red-600">-{chat.pointsUsed} pt</div>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-3 h-3 ${i < (chat.rating || 0) ? 'text-yellow-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 最近の取引 */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-gray-900">最近の取引</h3>
                  <button
                    onClick={() => setShowAllTransactions(true)}
                    className="text-blue-600 text-sm hover:text-blue-800"
                  >
                    すべて見る
                  </button>
                </div>
                <div className="space-y-2">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center py-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'purchase' ? 'bg-green-100' :
                          transaction.type === 'bonus' ? 'bg-blue-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'purchase' ? (
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          ) : transaction.type === 'bonus' ? (
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {transaction.description}
                          </div>
                          <div className="text-xs text-gray-700">
                            {transaction.date.split(' ')[0]}
                            {transaction.paymentMethod && ` • ${transaction.paymentMethod}`}
                            {transaction.fortuneTellerName && ` • ${transaction.fortuneTellerName}`}
                          </div>
                        </div>
                      </div>
                      <div className={`font-bold text-sm ${
                        transaction.type === 'purchase' || transaction.type === 'bonus'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}
                        {transaction.amount.toLocaleString()} pt
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-4 space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">チャット履歴</h3>
                <div className="space-y-4">
                  {chatHistory.map((chat) => (
                    <div key={chat.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{chat.fortuneTellerName}</h4>
                          <p className="text-sm text-gray-700">{chat.chatType}</p>
                        </div>
                        <span className="text-sm text-red-600 font-medium">-{chat.pointsUsed} pt</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-700">
                        <span>{chat.date} • {chat.duration}分</span>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < (chat.rating || 0) ? 'text-yellow-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="p-4 space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">アカウント情報</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-700">名前</label>
                    <p className="font-medium text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">メールアドレス</label>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">会員レベル</label>
                    <span className={`inline-block px-2 py-1 text-sm font-semibold rounded-full ${getMembershipBadge(user.membershipLevel).color}`}>
                      {getMembershipBadge(user.membershipLevel).label}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">登録日</label>
                    <p className="font-medium text-gray-900">{user.registeredAt}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">利用統計</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{user.totalPurchased.toLocaleString()}</div>
                    <div className="text-sm text-gray-700">累計購入ポイント</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{user.totalUsed.toLocaleString()}</div>
                    <div className="text-sm text-gray-700">累計利用ポイント</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="p-4 bg-white border-t border-gray-200 space-y-3">
          <LineButton 
            variant="primary"
            onClick={() => router.push('/points/purchase')}
          >
            ポイント購入
          </LineButton>
          
          <LineButton 
            variant="line"
            onClick={() => router.push('/chat')}
          >
            占いチャットを始める
          </LineButton>
        </div>
      </div>

      {/* 全取引履歴モーダル */}
      {showAllTransactions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">全取引履歴</h2>
              <button
                onClick={() => setShowAllTransactions(false)}
                className="text-gray-600 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4">
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-gray-700">
                        {transaction.date}
                        {transaction.paymentMethod && ` • ${transaction.paymentMethod}`}
                        {transaction.fortuneTellerName && ` • ${transaction.fortuneTellerName}`}
                      </div>
                    </div>
                    <div className={`font-bold text-sm ${
                      transaction.type === 'purchase' || transaction.type === 'bonus'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}
                      {transaction.amount.toLocaleString()} pt
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* チャット履歴モーダル */}
      {showChatHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">チャット履歴</h2>
              <button
                onClick={() => setShowChatHistory(false)}
                className="text-gray-600 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4">
              <div className="space-y-4">
                {chatHistory.map((chat) => (
                  <div key={chat.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{chat.fortuneTellerName}</h4>
                        <p className="text-sm text-gray-700">{chat.chatType}</p>
                      </div>
                      <span className="text-sm text-red-600 font-medium">-{chat.pointsUsed} pt</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-700">
                      <span>{chat.date} • {chat.duration}分</span>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < (chat.rating || 0) ? 'text-yellow-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </LineContainer>
  );
}