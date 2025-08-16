'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/AdminNav';

interface UserPoints {
  id: string;
  displayName: string;
  email?: string;
  balance: number;
  totalPurchased: number;
  totalUsed: number;
  transactionCount: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  lastTransaction?: {
    createdAt: string;
    type: string;
    amount: number;
    description: string;
  };
  createdAt: string;
  lastLoginAt?: string;
}

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  createdAt: string;
  type: 'PURCHASE' | 'USAGE' | 'BONUS' | 'ADJUSTMENT';
  amount: number;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  stripePaymentId?: string;
}

interface PointAdjustment {
  userId: string;
  amount: number;
  reason: string;
}

export default function AdminPointsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'SUSPENDED'>('all');
  const [sortBy, setSortBy] = useState<'balance' | 'totalPurchased' | 'totalUsed' | 'displayName'>('balance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState<UserPoints | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAllTransactionsModal, setShowAllTransactionsModal] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserPoints[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [transactionLoading, setTransactionLoading] = useState(false);
  
  const [adjustmentData, setAdjustmentData] = useState<PointAdjustment>({
    userId: '',
    amount: 0,
    reason: ''
  });

  useEffect(() => {
    checkAdminAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchUsers();
    }
  }, [currentPage, statusFilter, sortBy, sortOrder, searchQuery, loading]);

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/admin/check-auth', {
        credentials: 'include',
      });
      
      if (response.status === 401 || response.status === 403) {
        router.push('/admin/login');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Auth check failed');
      }
      
      // 認証OK、データ取得開始
      setLoading(false);
      
    } catch (error) {
      console.error('Admin auth check error:', error);
      router.push('/admin/login');
    }
  };

  useEffect(() => {
    if (showAllTransactionsModal) {
      fetchAllTransactions();
    }
  }, [showAllTransactionsModal]);

  const fetchUsers = async () => {
    try {
      setError(null);
      
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString(),
        status: statusFilter,
        sortBy: sortBy,
        sortOrder: sortOrder,
        search: searchQuery,
      });
      
      const response = await fetch(`/api/admin/points?${params}`, {
        credentials: 'include',
      });
      
      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }
      
      if (response.status === 403) {
        setError('管理者権限が必要です');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users);
      setTotalUsers(data.total);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('ユーザーデータの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTransactions = async () => {
    try {
      setTransactionLoading(true);
      const response = await fetch('/api/admin/transactions?limit=100');
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setTransactionLoading(false);
    }
  };

  const fetchUserTransactions = async (userId: string) => {
    try {
      setTransactionLoading(true);
      const response = await fetch(`/api/admin/transactions?userId=${userId}&limit=50`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user transactions');
      }
      
      const data = await response.json();
      setUserTransactions(data.transactions);
    } catch (error) {
      console.error('Error fetching user transactions:', error);
    } finally {
      setTransactionLoading(false);
    }
  };

  const adjustPoints = async () => {
    try {
      if (!adjustmentData.amount || !adjustmentData.reason.trim()) {
        setError('金額と理由を入力してください');
        return;
      }
      
      const response = await fetch('/api/admin/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(adjustmentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to adjust points');
      }
      
      await fetchUsers();
      setShowAdjustModal(false);
      setAdjustmentData({ userId: '', amount: 0, reason: '' });
      setSelectedUser(null);
      
    } catch (error: any) {
      console.error('Error adjusting points:', error);
      setError(error.message || 'ポイント調整に失敗しました');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status: UserPoints['status']) => {
    switch (status) {
      case 'ACTIVE': return 'アクティブ';
      case 'SUSPENDED': return '停止中';
      case 'DELETED': return '削除済み';
      default: return status;
    }
  };

  const getStatusColor = (status: UserPoints['status']) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'SUSPENDED': return 'text-red-600 bg-red-100';
      case 'DELETED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTransactionTypeText = (type: Transaction['type']) => {
    switch (type) {
      case 'PURCHASE': return '購入';
      case 'USAGE': return '利用';
      case 'BONUS': return 'ボーナス';
      case 'ADJUSTMENT': return '調整';
      default: return type;
    }
  };

  const getTransactionTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'PURCHASE': return 'text-green-600 bg-green-100';
      case 'USAGE': return 'text-red-600 bg-red-100';
      case 'BONUS': return 'text-blue-600 bg-blue-100';
      case 'ADJUSTMENT': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleAdjustPoints = (user: UserPoints) => {
    setSelectedUser(user);
    setAdjustmentData({
      userId: user.id,
      amount: 0,
      reason: ''
    });
    setShowAdjustModal(true);
  };

  const handleShowHistory = async (user: UserPoints) => {
    setSelectedUser(user);
    await fetchUserTransactions(user.id);
    setShowHistoryModal(true);
  };

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-700">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={() => fetchUsers()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalPoints = users.reduce((sum, user) => sum + user.balance, 0);
  const totalPurchased = users.reduce((sum, user) => sum + user.totalPurchased, 0);
  const totalUsed = users.reduce((sum, user) => sum + user.totalUsed, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">ポイント管理</h1>
            <button
              onClick={() => setShowAllTransactionsModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              全取引履歴
            </button>
          </div>

          {/* 統計情報 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 mb-1">総残高</div>
              <div className="text-2xl font-bold text-blue-900">{totalPoints.toLocaleString()} pt</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 mb-1">総購入額</div>
              <div className="text-2xl font-bold text-green-900">{totalPurchased.toLocaleString()} pt</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-sm text-red-600 mb-1">総利用額</div>
              <div className="text-2xl font-bold text-red-900">{totalUsed.toLocaleString()} pt</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 mb-1">アクティブユーザー</div>
              <div className="text-2xl font-bold text-purple-900">
                {users.filter(u => u.status === 'ACTIVE').length}
              </div>
            </div>
          </div>

          {/* 検索とフィルター */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="名前、メールで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">全てのステータス</option>
              <option value="ACTIVE">有効</option>
              <option value="SUSPENDED">停止中</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="balance">残高</option>
              <option value="totalPurchased">総購入額</option>
              <option value="totalUsed">総利用額</option>
              <option value="displayName">名前</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">降順</option>
              <option value="asc">昇順</option>
            </select>
          </div>

          {/* ポイント一覧テーブル */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ユーザー</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">残高</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">総購入</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">総利用</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">取引回数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最終取引</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">アクション</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {user.displayName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                          <div className="text-sm text-gray-500">{user.email || '未設定'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-blue-900">{user.balance.toLocaleString()} pt</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-green-600">{user.totalPurchased.toLocaleString()} pt</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-red-600">{user.totalUsed.toLocaleString()} pt</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.transactionCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastTransaction ? formatDate(user.lastTransaction.createdAt).split(' ')[0] : '未取引'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleAdjustPoints(user)}
                        className="text-purple-600 hover:text-purple-900 mr-3"
                      >
                        調整
                      </button>
                      <button
                        onClick={() => handleShowHistory(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        履歴
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ページネーション */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              {totalUsers} 件中 {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalUsers)} 件を表示
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                前へ
              </button>
              <span className="px-3 py-2 text-sm bg-blue-50 border border-blue-200 rounded-lg">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                次へ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ポイント調整モーダル */}
      {showAdjustModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">ポイント調整</h2>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="text-gray-600 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-700">対象ユーザー</div>
                <div className="font-medium text-gray-900">{selectedUser.displayName}</div>
                <div className="text-sm text-gray-500">現在の残高: {selectedUser.balance.toLocaleString()} pt</div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1">調整金額 (正の値で追加、負の値で減額)</label>
                <input
                  type="number"
                  value={adjustmentData.amount}
                  onChange={(e) => setAdjustmentData({...adjustmentData, amount: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 1000 または -500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1">調整理由</label>
                <textarea
                  value={adjustmentData.reason}
                  onChange={(e) => setAdjustmentData({...adjustmentData, reason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="調整の理由を入力してください"
                />
              </div>
              
              {adjustmentData.amount !== 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-blue-700">
                    調整後の残高: {(selectedUser.balance + adjustmentData.amount).toLocaleString()} pt
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={adjustPoints}
                  disabled={!adjustmentData.amount || !adjustmentData.reason.trim()}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  調整実行
                </button>
                <button
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ユーザー取引履歴モーダル */}
      {showHistoryModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">{selectedUser.displayName}さんの取引履歴</h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-600 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-6">
              {transactionLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">読み込み中...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(transaction.type)}`}>
                            {getTransactionTypeText(transaction.type)}
                          </span>
                          <span className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} pt
                        </div>
                        <div className="text-xs text-gray-500">残高: {transaction.balanceAfter.toLocaleString()} pt</div>
                      </div>
                    </div>
                  ))}
                  {userTransactions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      取引履歴がありません
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 全取引履歴モーダル */}
      {showAllTransactionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">全取引履歴</h2>
              <button
                onClick={() => setShowAllTransactionsModal(false)}
                className="text-gray-600 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {transactionLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">読み込み中...</p>
                </div>
              ) : (
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ユーザー</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">種類</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金額</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">内容</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日時</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{transaction.userName}</div>
                          <div className="text-sm text-gray-500">{transaction.userEmail || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(transaction.type)}`}>
                            {getTransactionTypeText(transaction.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} pt
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{transaction.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}