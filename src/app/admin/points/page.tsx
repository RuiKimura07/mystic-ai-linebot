'use client';

import { useState } from 'react';

interface UserPoints {
  id: string;
  name: string;
  email: string;
  balance: number;
  totalPurchased: number;
  totalUsed: number;
  purchaseCount: number;
  usageCount: number;
  status: 'active' | 'suspended';
  lastTransaction: string;
  registeredAt: string;
}

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  date: string;
  type: 'purchase' | 'usage' | 'adjustment';
  amount: number;
  description: string;
  paymentMethod?: string;
  adminNote?: string;
  balanceAfter: number;
}

interface PointAdjustment {
  userId: string;
  amount: number;
  reason: string;
  adminId: string;
}

export default function AdminPointsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [sortBy, setSortBy] = useState<'balance' | 'totalPurchased' | 'totalUsed' | 'lastTransaction'>('balance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState<UserPoints | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAllTransactionsModal, setShowAllTransactionsModal] = useState(false);
  const [showBulkAdjustModal, setShowBulkAdjustModal] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [bulkAdjustmentAmount, setBulkAdjustmentAmount] = useState('');
  const [bulkAdjustmentReason, setBulkAdjustmentReason] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<'all' | 'purchase' | 'usage' | 'adjustment'>('all');

  const [users, setUsers] = useState<UserPoints[]>([
    {
      id: '1',
      name: '山田太郎',
      email: 'yamada@example.com',
      balance: 1200,
      totalPurchased: 5000,
      totalUsed: 3800,
      purchaseCount: 8,
      usageCount: 12,
      status: 'active',
      lastTransaction: '2025/08/10 15:30',
      registeredAt: '2025/08/01'
    },
    {
      id: '2',
      name: '佐藤花子',
      email: 'sato@example.com',
      balance: 500,
      totalPurchased: 3000,
      totalUsed: 2500,
      purchaseCount: 3,
      usageCount: 5,
      status: 'suspended',
      lastTransaction: '2025/08/09 10:15',
      registeredAt: '2025/08/02'
    },
    {
      id: '3',
      name: '鈴木一郎',
      email: 'suzuki@example.com',
      balance: 3500,
      totalPurchased: 10000,
      totalUsed: 6500,
      purchaseCount: 15,
      usageCount: 20,
      status: 'active',
      lastTransaction: '2025/08/10 09:45',
      registeredAt: '2025/08/03'
    },
    {
      id: '4',
      name: '田中美咲',
      email: 'tanaka@example.com',
      balance: 800,
      totalPurchased: 2000,
      totalUsed: 1200,
      purchaseCount: 4,
      usageCount: 3,
      status: 'active',
      lastTransaction: '2025/08/11 08:20',
      registeredAt: '2025/08/04'
    },
    {
      id: '5',
      name: '高橋健一',
      email: 'takahashi@example.com',
      balance: 150,
      totalPurchased: 1500,
      totalUsed: 1350,
      purchaseCount: 2,
      usageCount: 4,
      status: 'active',
      lastTransaction: '2025/08/09 22:15',
      registeredAt: '2025/07/28'
    }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', userId: '1', userName: '山田太郎', date: '2025/08/10 15:30', type: 'purchase', amount: 3000, description: 'クレジットカード購入', paymentMethod: 'Visa ****1234', balanceAfter: 4200 },
    { id: '2', userId: '1', userName: '山田太郎', date: '2025/08/10 14:15', type: 'usage', amount: -500, description: '恋愛相談チャット', balanceAfter: 1200 },
    { id: '3', userId: '2', userName: '佐藤花子', date: '2025/08/09 10:15', type: 'usage', amount: -300, description: '仕事運チャット', balanceAfter: 500 },
    { id: '4', userId: '3', userName: '鈴木一郎', date: '2025/08/08 16:45', type: 'purchase', amount: 5000, description: 'クレジットカード購入', paymentMethod: 'JCB ****5678', balanceAfter: 8500 },
    { id: '5', userId: '2', userName: '佐藤花子', date: '2025/08/07 09:30', type: 'adjustment', amount: 100, description: 'システムエラー補償', adminNote: 'チャット接続エラーによる補償', balanceAfter: 800 },
    { id: '6', userId: '3', userName: '鈴木一郎', date: '2025/08/06 13:20', type: 'usage', amount: -500, description: '総合運勢チャット', balanceAfter: 3500 },
    { id: '7', userId: '4', userName: '田中美咲', date: '2025/08/05 18:45', type: 'purchase', amount: 1000, description: 'クレジットカード購入', paymentMethod: 'MasterCard ****9012', balanceAfter: 1800 },
    { id: '8', userId: '4', userName: '田中美咲', date: '2025/08/04 20:30', type: 'usage', amount: -200, description: '健康運チャット', balanceAfter: 800 },
    { id: '9', userId: '5', userName: '高橋健一', date: '2025/08/03 11:15', type: 'adjustment', amount: -50, description: 'システム利用料調整', adminNote: '重複課金の修正', balanceAfter: 150 },
    { id: '10', userId: '1', userName: '山田太郎', date: '2025/08/02 16:20', type: 'purchase', amount: 2000, description: 'クレジットカード購入', paymentMethod: 'Visa ****1234', balanceAfter: 1700 }
  ]);

  // フィルタリングとソート
  let filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // ソート処理
  filteredUsers = filteredUsers.sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'balance':
        aValue = a.balance;
        bValue = b.balance;
        break;
      case 'totalPurchased':
        aValue = a.totalPurchased;
        bValue = b.totalPurchased;
        break;
      case 'totalUsed':
        aValue = a.totalUsed;
        bValue = b.totalUsed;
        break;
      case 'lastTransaction':
        aValue = new Date(a.lastTransaction);
        bValue = new Date(b.lastTransaction);
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // ページネーション
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // 取引履歴のフィルタリング
  let filteredTransactions = transactions;
  
  if (dateFilter) {
    filteredTransactions = filteredTransactions.filter(t => 
      t.date.startsWith(dateFilter)
    );
  }
  
  if (transactionTypeFilter !== 'all') {
    filteredTransactions = filteredTransactions.filter(t => 
      t.type === transactionTypeFilter
    );
  }

  const handleAdjustBalance = () => {
    if (!selectedUser || !adjustmentAmount || !adjustmentReason) {
      alert('必要な情報を入力してください');
      return;
    }
    
    const amount = parseInt(adjustmentAmount.replace(/[+\-]/g, ''));
    const isNegative = adjustmentAmount.includes('-');
    const finalAmount = isNegative ? -amount : amount;
    
    // ユーザー残高を更新
    setUsers(prevUsers => prevUsers.map(user => 
      user.id === selectedUser.id 
        ? { 
            ...user, 
            balance: Math.max(0, user.balance + finalAmount),
            lastTransaction: new Date().toLocaleString('ja-JP')
          }
        : user
    ));

    // 取引履歴を追加
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      userId: selectedUser.id,
      userName: selectedUser.name,
      date: new Date().toLocaleString('ja-JP'),
      type: 'adjustment',
      amount: finalAmount,
      description: `管理者による残高調整: ${adjustmentReason}`,
      adminNote: adjustmentReason,
      balanceAfter: Math.max(0, selectedUser.balance + finalAmount)
    };

    setTransactions(prev => [newTransaction, ...prev]);
    
    alert(`ユーザー「${selectedUser.name}」の残高を${finalAmount > 0 ? '+' : ''}${finalAmount}ポイント調整しました。\n新しい残高: ${Math.max(0, selectedUser.balance + finalAmount)}ポイント`);
    setShowAdjustModal(false);
    setAdjustmentAmount('');
    setAdjustmentReason('');
    setSelectedUser(null);
  };

  const handleBulkAdjust = () => {
    if (!bulkAdjustmentAmount || !bulkAdjustmentReason) {
      alert('必要な情報を入力してください');
      return;
    }

    const amount = parseInt(bulkAdjustmentAmount.replace(/[+\-]/g, ''));
    const isNegative = bulkAdjustmentAmount.includes('-');
    const finalAmount = isNegative ? -amount : amount;

    const targetUsers = filteredUsers.filter(user => user.status === 'active');
    
    if (!confirm(`${targetUsers.length}人のアクティブユーザーに${finalAmount > 0 ? '+' : ''}${finalAmount}ポイントを一括調整します。\n\n実行しますか？`)) {
      return;
    }

    // 全ユーザーの残高を更新
    setUsers(prevUsers => prevUsers.map(user => 
      targetUsers.some(tu => tu.id === user.id)
        ? { 
            ...user, 
            balance: Math.max(0, user.balance + finalAmount),
            lastTransaction: new Date().toLocaleString('ja-JP')
          }
        : user
    ));

    // 各ユーザーの取引履歴を追加
    const newTransactions: Transaction[] = targetUsers.map(user => ({
      id: `${Date.now()}-${user.id}`,
      userId: user.id,
      userName: user.name,
      date: new Date().toLocaleString('ja-JP'),
      type: 'adjustment' as const,
      amount: finalAmount,
      description: `一括調整: ${bulkAdjustmentReason}`,
      adminNote: bulkAdjustmentReason,
      balanceAfter: Math.max(0, user.balance + finalAmount)
    }));

    setTransactions(prev => [...newTransactions, ...prev]);
    
    alert(`${targetUsers.length}人のユーザーに${finalAmount > 0 ? '+' : ''}${finalAmount}ポイントを一括調整しました。`);
    setShowBulkAdjustModal(false);
    setBulkAdjustmentAmount('');
    setBulkAdjustmentReason('');
  };

  const handleExportCsv = () => {
    const csvData = [
      ['日時', 'ユーザーID', 'ユーザー名', '種別', '金額', '説明', '調整後残高', '管理者メモ'],
      ...filteredTransactions.map(t => [
        t.date,
        t.userId,
        t.userName,
        t.type === 'purchase' ? '購入' : t.type === 'usage' ? '利用' : '調整',
        t.amount,
        t.description,
        t.balanceAfter,
        t.adminNote || ''
      ])
    ];

    const csvContent = csvData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `point_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">ポイント管理</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkAdjustModal(true)}
                className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                一括調整
              </button>
              <button
                onClick={() => setShowAllTransactionsModal(true)}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                全取引履歴
              </button>
              <button
                onClick={handleExportCsv}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                CSV出力
              </button>
            </div>
          </div>

          {/* 統計情報 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 mb-1">総ポイント残高</div>
              <div className="text-2xl font-bold text-blue-900">
                {users.reduce((sum, user) => sum + user.balance, 0).toLocaleString()} pt
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 mb-1">累計購入総額</div>
              <div className="text-2xl font-bold text-green-900">
                {users.reduce((sum, user) => sum + user.totalPurchased, 0).toLocaleString()} pt
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 mb-1">累計利用総額</div>
              <div className="text-2xl font-bold text-purple-900">
                {users.reduce((sum, user) => sum + user.totalUsed, 0).toLocaleString()} pt
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm text-orange-600 mb-1">今月の売上</div>
              <div className="text-2xl font-bold text-orange-900">
                ¥{(18500).toLocaleString()}
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-sm text-red-600 mb-1">今日の取引数</div>
              <div className="text-2xl font-bold text-red-900">24</div>
            </div>
          </div>

          {/* 検索・フィルタエリア */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="ユーザー名・メールアドレス・IDで検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-[300px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">全ステータス</option>
                <option value="active">有効のみ</option>
                <option value="suspended">停止のみ</option>
              </select>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">並び順:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                >
                  <option value="balance">残高順</option>
                  <option value="totalPurchased">累計購入順</option>
                  <option value="totalUsed">累計利用順</option>
                  <option value="lastTransaction">最終取引順</option>
                </select>
                <button 
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm"
                >
                  {sortOrder === 'asc' ? '昇順 ↑' : '降順 ↓'}
                </button>
              </div>
            </div>
          </div>

          {/* ユーザーテーブル */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ユーザー名</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">残高</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">購入履歴</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">利用履歴</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">ステータス</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{user.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                        <div className="text-xs text-gray-600">最終: {user.lastTransaction}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-lg text-blue-600">
                        {user.balance.toLocaleString()} pt
                      </div>
                      <div className="text-xs text-gray-600">
                        購入: {user.totalPurchased.toLocaleString()} / 利用: {user.totalUsed.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold">{user.purchaseCount}</span>
                      <span className="text-sm text-gray-600"> 回</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold">{user.usageCount}</span>
                      <span className="text-sm text-gray-600"> 回</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'active' ? '有効' : '停止'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowAdjustModal(true);
                          }}
                          className="px-2 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition-colors"
                        >
                          残高調整
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowHistoryModal(true);
                          }}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          履歴表示
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ページネーション */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} / 全 {filteredUsers.length} 件
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded transition-colors ${
                  currentPage === 1 
                    ? 'border-gray-200 text-gray-600 cursor-not-allowed' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                前へ
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button 
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded transition-colors ${
                  currentPage === totalPages 
                    ? 'border-gray-200 text-gray-600 cursor-not-allowed' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                次へ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Adjustment Modal */}
      {showAdjustModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ポイント残高調整</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">対象ユーザー</label>
                <p className="font-semibold">{selectedUser.name} (ID: {selectedUser.id})</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-600">現在の残高</label>
                <p className="font-semibold text-lg text-blue-600">{selectedUser.balance.toLocaleString()} pt</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  調整ポイント（+/-を含めて入力） *
                </label>
                <input
                  type="text"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  placeholder="例: +500 または -200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                {adjustmentAmount && (
                  <p className="text-sm text-gray-600 mt-1">
                    調整後残高: {Math.max(0, selectedUser.balance + parseInt(adjustmentAmount.replace(/[+\-]/g, '')) * (adjustmentAmount.includes('-') ? -1 : 1)).toLocaleString()} pt
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  調整理由 *
                </label>
                <textarea
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  rows={3}
                  placeholder="調整の理由を詳しく入力してください"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAdjustModal(false);
                    setAdjustmentAmount('');
                    setAdjustmentReason('');
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAdjustBalance}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  調整実行
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Adjustment Modal */}
      {showBulkAdjustModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">一括ポイント調整</h2>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="text-sm text-yellow-800">
                  <strong>注意:</strong> アクティブユーザー全員（{users.filter(u => u.status === 'active').length}人）に一括調整を行います。
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  調整ポイント（+/-を含めて入力） *
                </label>
                <input
                  type="text"
                  value={bulkAdjustmentAmount}
                  onChange={(e) => setBulkAdjustmentAmount(e.target.value)}
                  placeholder="例: +100 または -50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  調整理由 *
                </label>
                <textarea
                  value={bulkAdjustmentReason}
                  onChange={(e) => setBulkAdjustmentReason(e.target.value)}
                  rows={3}
                  placeholder="一括調整の理由を詳しく入力してください"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowBulkAdjustModal(false);
                    setBulkAdjustmentAmount('');
                    setBulkAdjustmentReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleBulkAdjust}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  一括調整実行
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User History Modal */}
      {showHistoryModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">取引履歴</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedUser.name} (ID: {selectedUser.id})
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-600 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">日時</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">種別</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">説明</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">金額</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">残高</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.filter(t => t.userId === selectedUser.id).map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-sm text-gray-600">{transaction.date}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          transaction.type === 'purchase'
                            ? 'bg-green-100 text-green-800'
                            : transaction.type === 'usage'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {transaction.type === 'purchase' ? '購入' :
                           transaction.type === 'usage' ? '利用' : '調整'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-sm">
                        {transaction.description}
                        {transaction.paymentMethod && (
                          <div className="text-xs text-gray-600 mt-1">{transaction.paymentMethod}</div>
                        )}
                        {transaction.adminNote && (
                          <div className="text-xs text-orange-600 mt-1">管理者メモ: {transaction.adminNote}</div>
                        )}
                      </td>
                      <td className={`py-2 px-3 text-right font-semibold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} pt
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-gray-900">
                        {transaction.balanceAfter.toLocaleString()} pt
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Transactions Modal */}
      {showAllTransactionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">全取引履歴</h2>
                <p className="text-sm text-gray-600 mt-1">システム全体の取引履歴</p>
              </div>
              <button
                onClick={() => setShowAllTransactionsModal(false)}
                className="text-gray-600 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* フィルタ */}
            <div className="flex flex-wrap gap-4 mb-4">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
              <select
                value={transactionTypeFilter}
                onChange={(e) => setTransactionTypeFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              >
                <option value="all">全種別</option>
                <option value="purchase">購入のみ</option>
                <option value="usage">利用のみ</option>
                <option value="adjustment">調整のみ</option>
              </select>
              <button
                onClick={() => {
                  setDateFilter('');
                  setTransactionTypeFilter('all');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-700"
              >
                フィルタクリア
              </button>
            </div>

            <div className="overflow-y-auto max-h-[65vh]">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">日時</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">ユーザー</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">種別</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">説明</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">金額</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700">残高</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.slice().reverse().map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 text-sm text-gray-600">{transaction.date}</td>
                      <td className="py-2 px-3 text-sm">
                        <div className="font-medium text-gray-900">{transaction.userName}</div>
                        <div className="text-xs text-gray-600">ID: {transaction.userId}</div>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          transaction.type === 'purchase'
                            ? 'bg-green-100 text-green-800'
                            : transaction.type === 'usage'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {transaction.type === 'purchase' ? '購入' :
                           transaction.type === 'usage' ? '利用' : '調整'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-sm">
                        {transaction.description}
                        {transaction.paymentMethod && (
                          <div className="text-xs text-gray-600 mt-1">{transaction.paymentMethod}</div>
                        )}
                        {transaction.adminNote && (
                          <div className="text-xs text-orange-600 mt-1">管理者メモ: {transaction.adminNote}</div>
                        )}
                      </td>
                      <td className={`py-2 px-3 text-right font-semibold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} pt
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-gray-900">
                        {transaction.balanceAfter.toLocaleString()} pt
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                表示中: {filteredTransactions.length} 件
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCsv}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  CSV出力
                </button>
                <button
                  onClick={() => setShowAllTransactionsModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}