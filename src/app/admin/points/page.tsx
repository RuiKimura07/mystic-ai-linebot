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
}

interface Transaction {
  id: string;
  date: string;
  type: 'purchase' | 'usage' | 'adjustment';
  amount: number;
  description: string;
}

export default function AdminPointsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserPoints | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  const [users] = useState<UserPoints[]>([
    {
      id: '1',
      name: '山田太郎',
      email: 'yamada@example.com',
      balance: 1200,
      totalPurchased: 5000,
      totalUsed: 3800,
      purchaseCount: 5,
      usageCount: 3,
    },
    {
      id: '2',
      name: '佐藤花子',
      email: 'sato@example.com',
      balance: 500,
      totalPurchased: 2000,
      totalUsed: 1500,
      purchaseCount: 2,
      usageCount: 1,
    },
    {
      id: '3',
      name: '鈴木一郎',
      email: 'suzuki@example.com',
      balance: 3500,
      totalPurchased: 8000,
      totalUsed: 4500,
      purchaseCount: 7,
      usageCount: 5,
    },
  ]);

  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      date: '2025/08/10 15:30',
      type: 'purchase',
      amount: 3000,
      description: 'クレジットカード購入',
    },
    {
      id: '2',
      date: '2025/08/09 10:15',
      type: 'usage',
      amount: -500,
      description: '占いチャット利用',
    },
    {
      id: '3',
      date: '2025/08/08 14:20',
      type: 'adjustment',
      amount: 100,
      description: 'システムエラー補償',
    },
  ]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.id.includes(searchQuery)
  );

  const handleAdjustBalance = () => {
    if (!selectedUser || !adjustmentAmount || !adjustmentReason) {
      alert('必要な情報を入力してください');
      return;
    }
    
    console.log('Adjust balance:', {
      userId: selectedUser.id,
      amount: adjustmentAmount,
      reason: adjustmentReason,
    });
    
    setShowAdjustModal(false);
    setAdjustmentAmount('');
    setAdjustmentReason('');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">ポイント管理</h1>

          <div className="mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="ユーザー名 / メールアドレス / IDで検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                検索
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 mb-1">総ポイント残高</div>
              <div className="text-2xl font-bold text-blue-900">
                {users.reduce((sum, user) => sum + user.balance, 0).toLocaleString()} pt
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 mb-1">今月の購入総額</div>
              <div className="text-2xl font-bold text-green-900">
                ¥{(15000).toLocaleString()}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 mb-1">今月の利用総額</div>
              <div className="text-2xl font-bold text-purple-900">
                {(8000).toLocaleString()} pt
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">ユーザー名</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-800">残高</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-800">購入履歴</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-800">利用履歴</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-800">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{user.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-800">{user.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-lg text-blue-600">
                        {user.balance.toLocaleString()} pt
                      </div>
                      <div className="text-xs text-gray-800">
                        購入: {user.totalPurchased.toLocaleString()} / 利用: {user.totalUsed.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold">{user.purchaseCount}</span>
                      <span className="text-sm text-gray-800"> 回</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold">{user.usageCount}</span>
                      <span className="text-sm text-gray-800"> 回</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowAdjustModal(true);
                          }}
                          className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors"
                        >
                          残高調整
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowHistoryModal(true);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
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
        </div>
      </div>

      {/* Balance Adjustment Modal */}
      {showAdjustModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ポイント残高調整</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-800">対象ユーザー</label>
                <p className="font-semibold">{selectedUser.name} (ID: {selectedUser.id})</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-800">現在の残高</label>
                <p className="font-semibold text-lg">{selectedUser.balance.toLocaleString()} pt</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  調整ポイント（+/-を含めて入力）
                </label>
                <input
                  type="text"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  placeholder="例: +500 または -200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  調整理由
                </label>
                <textarea
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  rows={3}
                  placeholder="調整の理由を入力してください"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAdjustModal(false);
                    setAdjustmentAmount('');
                    setAdjustmentReason('');
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

      {/* History Modal */}
      {showHistoryModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">取引履歴</h2>
                <p className="text-sm text-gray-800 mt-1">
                  {selectedUser.name} (ID: {selectedUser.id})
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-800 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto max-h-[50vh]">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-semibold text-gray-800">日時</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-800">種別</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-800">説明</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-800">金額</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-sm text-gray-800">{transaction.date}</td>
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
                      <td className="py-2 px-3 text-sm">{transaction.description}</td>
                      <td className={`py-2 px-3 text-right font-semibold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} pt
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
    </div>
  );
}