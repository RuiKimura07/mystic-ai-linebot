'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LineContainer from '@/components/LineContainer';
import LineButton from '@/components/LineButton';

interface Transaction {
  id: string;
  type: 'PURCHASE' | 'USAGE' | 'BONUS' | 'ADJUSTMENT' | 'EXPIRATION';
  amount: number;
  description: string;
  createdAt: string;
  balanceBefore: number;
  balanceAfter: number;
  stripePaymentId?: string;
  expiresAt?: string;
  isExpired?: boolean;
}

interface User {
  id: string;
  lineUserId: string;
  displayName: string;
  pictureUrl?: string;
  email?: string;
  balance: number;
  totalPurchased: number;
  totalUsed: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  role: 'USER' | 'ADMIN';
  createdAt: string;
  lastLoginAt?: string;
  transactions: Transaction[];
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExpirationModal, setShowExpirationModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [chatHistory] = useState<ChatHistory[]>([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/user', {
        credentials: 'include', // クッキーを含める
      });
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('ユーザー情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include', // クッキーを含める
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      router.push('/login');
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 削除成功 - ログインページにリダイレクト
        router.push('/login?deleted=true');
      } else {
        setError(data.error || 'アカウント削除に失敗しました');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      setError('アカウント削除処理中にエラーが発生しました');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getMembershipBadge = (balance: number) => {
    const badges = {
      bronze: { color: 'bg-amber-100 text-amber-800', label: 'ブロンズ' },
      silver: { color: 'bg-gray-100 text-gray-800', label: 'シルバー' },
      gold: { color: 'bg-yellow-100 text-yellow-800', label: 'ゴールド' },
      platinum: { color: 'bg-purple-100 text-purple-800', label: 'プラチナ' }
    };
    
    if (balance >= 10000) return badges.platinum;
    if (balance >= 5000) return badges.gold;
    if (balance >= 2000) return badges.silver;
    return badges.bronze;
  };

  const getThisMonthStats = () => {
    if (!user?.transactions) return { totalUsed: 0, chatCount: 0 };
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const thisMonth = user.transactions.filter(t => {
      const transactionDate = new Date(t.createdAt);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });
    
    const totalUsed = thisMonth.filter(t => t.type === 'USAGE').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const chatCount = thisMonth.filter(t => t.type === 'USAGE').length;
    return { totalUsed, chatCount };
  };

  const thisMonthStats = getThisMonthStats();

  const getExpirationInfo = () => {
    if (!user?.transactions) return [];
    
    // 購入トランザクションで期限切れでないものを取得
    const activeTransactions = user.transactions
      .filter(t => t.type === 'PURCHASE' && !t.isExpired && t.expiresAt)
      .map(t => ({
        amount: t.amount,
        purchaseDate: new Date(t.createdAt),
        expirationDate: new Date(t.expiresAt!),
        daysRemaining: Math.ceil((new Date(t.expiresAt!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      }))
      .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime());
    
    return activeTransactions;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
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

  if (error) {
    return (
      <LineContainer>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={() => fetchUserData()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              再試行
            </button>
          </div>
        </div>
      </LineContainer>
    );
  }

  if (!user) {
    return (
      <LineContainer>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-gray-700">ユーザー情報が見つかりません</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ログインページへ
            </button>
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
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getMembershipBadge(user.balance).color}`}>
                {getMembershipBadge(user.balance).label}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-700 text-sm hover:text-gray-900"
            >
              ログアウト
            </button>
          </div>
          <p className="text-sm text-gray-700 mt-1">ようこそ、{user.displayName}さん</p>
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
                  <div className="flex-1">
                    <div className="text-sm opacity-90 mb-1">現在の残高</div>
                    <div className="text-3xl font-bold mb-2">{user.balance.toLocaleString()} pt</div>
                    <button
                      onClick={() => setShowExpirationModal(true)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                    >
                      📅 ポイント有効期限
                    </button>
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
                  <div className="text-xs text-purple-600 mt-1">登録から{chatHistory.length}回</div>
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
                  {chatHistory.length > 0 ? (
                    chatHistory.slice(0, 3).map((chat) => (
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
                    ))
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">まだチャット履歴がありません</p>
                      <p className="text-gray-400 text-xs mt-1">占いチャットを始めてみましょう</p>
                    </div>
                  )}
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
                  {user.transactions && user.transactions.length > 0 ? (
                    user.transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center py-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'PURCHASE' ? 'bg-green-100' :
                          transaction.type === 'BONUS' ? 'bg-blue-100' :
                          transaction.type === 'ADJUSTMENT' ? (transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100') :
                          'bg-red-100'
                        }`}>
                          {transaction.type === 'PURCHASE' ? (
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          ) : transaction.type === 'BONUS' ? (
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                          ) : transaction.type === 'ADJUSTMENT' ? (
                            transaction.amount > 0 ? (
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            )
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
                            {formatDate(transaction.createdAt)}
                            {transaction.stripePaymentId && ' • Stripe決済'}
                          </div>
                        </div>
                      </div>
                      <div className={`font-bold text-sm ${
                        transaction.type === 'PURCHASE' || transaction.type === 'BONUS' || 
                        (transaction.type === 'ADJUSTMENT' && transaction.amount > 0)
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}
                        {transaction.amount.toLocaleString()} pt
                      </div>
                    </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002 2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">まだ取引履歴がありません</p>
                      <p className="text-gray-400 text-xs mt-1">ポイントを購入して占いを始めましょう</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-4 space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">チャット履歴</h3>
                <div className="space-y-4">
                  {chatHistory.length > 0 ? (
                    chatHistory.map((chat) => (
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
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">チャット履歴がありません</h4>
                      <p className="text-gray-500 text-sm mb-4">占い師とのチャットをして履歴を作成しましょう</p>
                      <button
                        onClick={() => router.push('/chat')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        占いチャットを始める
                      </button>
                    </div>
                  )}
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
                    <p className="font-medium text-gray-900">{user.displayName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">メールアドレス</label>
                    <p className="font-medium text-gray-900">{user.email || '未設定'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">会員レベル</label>
                    <span className={`inline-block px-2 py-1 text-sm font-semibold rounded-full ${getMembershipBadge(user.balance).color}`}>
                      {getMembershipBadge(user.balance).label}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">アカウント状態</label>
                    <p className="font-medium text-gray-900">
                      {user.status === 'ACTIVE' ? 'アクティブ' : 
                       user.status === 'SUSPENDED' ? '停止中' : '削除済み'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">登録日</label>
                    <p className="font-medium text-gray-900">{formatDate(user.createdAt).split(' ')[0]}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">最終ログイン</label>
                    <p className="font-medium text-gray-900">
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : '記録なし'}
                    </p>
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
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">アカウント設定</h3>
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-red-800 font-medium mb-2">アカウントの削除</h4>
                    <p className="text-red-700 text-sm mb-4">
                      アカウントを削除すると、すべてのデータが完全に削除され、復旧できません。
                      この操作は取り消すことができませんので、慎重にお考えください。
                    </p>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      アカウントを削除
                    </button>
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
                {user.transactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-gray-700">
                        {formatDate(transaction.createdAt)}
                        {transaction.stripePaymentId && ' • Stripe決済'}
                      </div>
                    </div>
                    <div className={`font-bold text-sm ${
                      transaction.type === 'PURCHASE' || transaction.type === 'BONUS' || 
                      (transaction.type === 'ADJUSTMENT' && transaction.amount > 0)
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

      {/* アカウント削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">アカウント削除の確認</h3>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  本当にアカウントを削除しますか？この操作により以下のデータがすべて削除されます：
                </p>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li>• アカウント情報（名前、メールアドレス等）</li>
                  <li>• ポイント残高（現在：{user?.balance.toLocaleString()} pt）</li>
                  <li>• 取引履歴</li>
                  <li>• チャット履歴</li>
                  <li>• その他すべての関連データ</li>
                </ul>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm font-medium">
                    ⚠️ この操作は取り消すことができません
                  </p>
                </div>
              </div>
              
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      削除中...
                    </>
                  ) : (
                    'アカウントを削除'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ポイント有効期限モーダル */}
      {showExpirationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">ポイント有効期限</h2>
              <button
                onClick={() => setShowExpirationModal(false)}
                className="text-gray-600 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4">
              {(() => {
                const expirationInfo = getExpirationInfo();
                if (expirationInfo.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">有効期限のあるポイントはありません</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-blue-800 text-sm">
                        ポイントの有効期限は購入から6ヶ月です。
                        期限が近いポイントから自動的に使用されます。
                      </p>
                    </div>
                    
                    {expirationInfo.map((item, index) => {
                      const isExpiringSoon = item.daysRemaining <= 30;
                      const isExpired = item.daysRemaining <= 0;
                      
                      return (
                        <div
                          key={index}
                          className={`border rounded-lg p-4 ${
                            isExpired ? 'border-red-300 bg-red-50' :
                            isExpiringSoon ? 'border-yellow-300 bg-yellow-50' :
                            'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium text-gray-900">
                                {item.amount.toLocaleString()} pt
                              </div>
                              <div className="text-sm text-gray-600">
                                購入日: {item.purchaseDate.toLocaleDateString('ja-JP')}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-medium ${
                                isExpired ? 'text-red-600' :
                                isExpiringSoon ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {isExpired ? '期限切れ' :
                                 isExpiringSoon ? `あと${item.daysRemaining}日` :
                                 `${item.daysRemaining}日`}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.expirationDate.toLocaleDateString('ja-JP')}まで
                              </div>
                            </div>
                          </div>
                          
                          {isExpiringSoon && !isExpired && (
                            <div className="mt-2 flex items-center text-yellow-700 text-xs">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              まもなく有効期限を迎えます
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">有効ポイント合計</span>
                        <span className="font-bold text-gray-900">
                          {expirationInfo.reduce((sum, item) => sum + item.amount, 0).toLocaleString()} pt
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </LineContainer>
  );
}