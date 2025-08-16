'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  displayName: string;
  email?: string;
  createdAt: string;
  balance: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  lastLoginAt?: string;
  lineUserId: string;
  pictureUrl?: string;
  totalPurchased: number;
  totalUsed: number;
  role: 'USER' | 'ADMIN';
  transactionCount: number;
  recentTransactions: Transaction[];
}

interface Transaction {
  id: string;
  createdAt: string;
  type: 'PURCHASE' | 'USAGE' | 'BONUS' | 'ADJUSTMENT';
  amount: number;
  description: string;
  stripePaymentId?: string;
}

interface EditUserFormData {
  displayName: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'SUSPENDED'>('all');
  const [sortBy, setSortBy] = useState<'displayName' | 'createdAt' | 'lastLoginAt' | 'balance'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [editFormData, setEditFormData] = useState<EditUserFormData>({
    displayName: '',
    email: '',
    status: 'ACTIVE'
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, statusFilter, sortBy, sortOrder, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString(),
        status: statusFilter,
        sortBy: sortBy,
        sortOrder: sortOrder,
        search: searchQuery,
      });
      
      const response = await fetch(`/api/admin/users?${params}`);
      
      if (response.status === 401) {
        router.push('/login');
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

  const updateUser = async (userId: string, updates: Partial<EditUserFormData>) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          updates,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      await fetchUsers();
      setShowEditModal(false);
      setSelectedUser(null);
      
    } catch (error) {
      console.error('Error updating user:', error);
      setError('ユーザーの更新に失敗しました');
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

  const getStatusText = (status: User['status']) => {
    switch (status) {
      case 'ACTIVE': return 'アクティブ';
      case 'SUSPENDED': return '停止中';
      case 'DELETED': return '削除済み';
      default: return status;
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'SUSPENDED': return 'text-red-600 bg-red-100';
      case 'DELETED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      displayName: user.displayName,
      email: user.email || '',
      status: user.status,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser || !editFormData.displayName.trim()) {
      setError('表示名は必須です');
      return;
    }

    await updateUser(selectedUser.id, editFormData);
  };

  const handleShowDetail = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">ユーザー管理</h1>

          {/* 統計情報 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 mb-1">総ユーザー数</div>
              <div className="text-2xl font-bold text-blue-900">{totalUsers}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 mb-1">有効ユーザー</div>
              <div className="text-2xl font-bold text-green-900">
                {users.filter(u => u.status === 'ACTIVE').length}
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-sm text-red-600 mb-1">停止ユーザー</div>
              <div className="text-2xl font-bold text-red-900">
                {users.filter(u => u.status === 'SUSPENDED').length}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 mb-1">削除ユーザー</div>
              <div className="text-2xl font-bold text-purple-900">
                {users.filter(u => u.status === 'DELETED').length}
              </div>
            </div>
          </div>

          {/* 検索とフィルター */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="名前、メール、LINE IDで検索..."
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
              <option value="createdAt">登録日</option>
              <option value="displayName">名前</option>
              <option value="lastLoginAt">最終ログイン</option>
              <option value="balance">残高</option>
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

          {/* ユーザーテーブル */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ユーザー</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">残高</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">取引回数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">登録日</th>
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
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {getStatusText(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.balance.toLocaleString()} pt
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.transactionCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt).split(' ')[0]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleShowDetail(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        詳細
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        編集
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

      {/* 詳細モーダル */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">ユーザー詳細</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-600 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-700">表示名</label>
                  <p className="font-medium text-gray-900">{selectedUser.displayName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-700">メール</label>
                  <p className="font-medium text-gray-900">{selectedUser.email || '未設定'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-700">LINE ID</label>
                  <p className="font-medium text-gray-900 text-xs">{selectedUser.lineUserId}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-700">残高</label>
                  <p className="font-medium text-gray-900">{selectedUser.balance.toLocaleString()} pt</p>
                </div>
                <div>
                  <label className="text-sm text-gray-700">累計購入</label>
                  <p className="font-medium text-gray-900">{selectedUser.totalPurchased.toLocaleString()} pt</p>
                </div>
                <div>
                  <label className="text-sm text-gray-700">累計利用</label>
                  <p className="font-medium text-gray-900">{selectedUser.totalUsed.toLocaleString()} pt</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-700 block mb-2">最近の取引</label>
                <div className="space-y-2">
                  {selectedUser.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                      <div>
                        <div className="text-sm font-medium">{transaction.description}</div>
                        <div className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</div>
                      </div>
                      <div className={`text-sm font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} pt
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">ユーザー編集</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-600 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">表示名</label>
                <input
                  type="text"
                  value={editFormData.displayName}
                  onChange={(e) => setEditFormData({...editFormData, displayName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">メールアドレス</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">ステータス</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({...editFormData, status: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">有効</option>
                  <option value="SUSPENDED">停止</option>
                  <option value="DELETED">削除</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  保存
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}