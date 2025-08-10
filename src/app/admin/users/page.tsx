'use client';

import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
  balance: number;
  status: 'active' | 'suspended';
  lastLogin: string;
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const [users] = useState<User[]>([
    {
      id: '1',
      name: '山田太郎',
      email: 'yamada@example.com',
      registeredAt: '2025/08/01',
      balance: 1200,
      status: 'active',
      lastLogin: '2025/08/10 15:30',
    },
    {
      id: '2',
      name: '佐藤花子',
      email: 'sato@example.com',
      registeredAt: '2025/08/02',
      balance: 500,
      status: 'suspended',
      lastLogin: '2025/08/09 10:15',
    },
    {
      id: '3',
      name: '鈴木一郎',
      email: 'suzuki@example.com',
      registeredAt: '2025/08/03',
      balance: 3500,
      status: 'active',
      lastLogin: '2025/08/10 09:45',
    },
  ]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.id.includes(searchQuery)
  );

  const handleToggleStatus = (userId: string) => {
    console.log('Toggle status for user:', userId);
    // API call to toggle user status
  };

  const handleShowDetail = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">ユーザー管理</h1>

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

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">名前</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">メール</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">登録日</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">残高</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">状態</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{user.id}</td>
                    <td className="py-3 px-4 text-gray-900">{user.name}</td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4 text-gray-600">{user.registeredAt}</td>
                    <td className="py-3 px-4 text-right text-gray-900 font-semibold">
                      {user.balance.toLocaleString()} pt
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'active' ? '有効' : '停止'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleShowDetail(user)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          詳細
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`px-3 py-1 text-white text-sm rounded transition-colors ${
                            user.status === 'active'
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {user.status === 'active' ? '停止' : '解除'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              全 {filteredUsers.length} 件
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                前へ
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded">1</button>
              <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                2
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                次へ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">ユーザー詳細</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">ユーザーID</label>
                  <p className="font-semibold">{selectedUser.id}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">状態</label>
                  <p className="font-semibold">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                      selectedUser.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUser.status === 'active' ? '有効' : '停止'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">名前</label>
                  <p className="font-semibold">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">メールアドレス</label>
                  <p className="font-semibold">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">登録日</label>
                  <p className="font-semibold">{selectedUser.registeredAt}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">最終ログイン</label>
                  <p className="font-semibold">{selectedUser.lastLogin}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">ポイント残高</label>
                  <p className="font-semibold text-lg text-blue-600">
                    {selectedUser.balance.toLocaleString()} pt
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">最近の取引</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span>2025/08/10 - ポイント購入</span>
                    <span className="text-green-600">+1000 pt</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>2025/08/09 - 占いチャット利用</span>
                    <span className="text-red-600">-500 pt</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  閉じる
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  編集
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}