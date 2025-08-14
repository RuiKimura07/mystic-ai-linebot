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
  lineUserId: string;
  phoneNumber?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  prefecture?: string;
  totalPurchased: number;
  totalUsed: number;
  purchaseCount: number;
  usageCount: number;
  suspensionReason?: string;
  suspendedAt?: string;
  profileImageUrl?: string;
  notes?: string;
}

interface Transaction {
  id: string;
  date: string;
  type: 'purchase' | 'usage' | 'adjustment';
  amount: number;
  description: string;
  paymentMethod?: string;
  chatSession?: string;
}

interface EditUserFormData {
  name: string;
  email: string;
  phoneNumber: string;
  notes: string;
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'registeredAt' | 'lastLogin' | 'balance'>('registeredAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [editFormData, setEditFormData] = useState<EditUserFormData>({
    name: '',
    email: '',
    phoneNumber: '',
    notes: ''
  });
  
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: '山田太郎',
      email: 'yamada@example.com',
      registeredAt: '2025/08/01',
      balance: 1200,
      status: 'active',
      lastLogin: '2025/08/10 15:30',
      lineUserId: 'U1234567890abcdef1234567890abcdef',
      phoneNumber: '090-1234-5678',
      age: 28,
      gender: 'male',
      prefecture: '東京都',
      totalPurchased: 5000,
      totalUsed: 3800,
      purchaseCount: 8,
      usageCount: 12,
      profileImageUrl: '',
      notes: 'VIPユーザー。定期的に利用している。'
    },
    {
      id: '2',
      name: '佐藤花子',
      email: 'sato@example.com',
      registeredAt: '2025/08/02',
      balance: 500,
      status: 'suspended',
      lastLogin: '2025/08/09 10:15',
      lineUserId: 'U0987654321fedcba0987654321fedcba',
      phoneNumber: '080-9876-5432',
      age: 35,
      gender: 'female',
      prefecture: '大阪府',
      totalPurchased: 3000,
      totalUsed: 2500,
      purchaseCount: 3,
      usageCount: 5,
      suspensionReason: '不適切な言動により一時停止',
      suspendedAt: '2025/08/05',
      profileImageUrl: '',
      notes: '警告履歴あり。要注意ユーザー。'
    },
    {
      id: '3',
      name: '鈴木一郎',
      email: 'suzuki@example.com',
      registeredAt: '2025/08/03',
      balance: 3500,
      status: 'active',
      lastLogin: '2025/08/10 09:45',
      lineUserId: 'U1122334455667788991122334455667',
      phoneNumber: '070-5555-1111',
      age: 42,
      gender: 'male',
      prefecture: '神奈川県',
      totalPurchased: 10000,
      totalUsed: 6500,
      purchaseCount: 15,
      usageCount: 20,
      profileImageUrl: '',
      notes: 'ヘビーユーザー。月間利用額が高い。'
    },
    {
      id: '4',
      name: '田中美咲',
      email: 'tanaka@example.com',
      registeredAt: '2025/08/04',
      balance: 800,
      status: 'active',
      lastLogin: '2025/08/11 08:20',
      lineUserId: 'U9988776655443322119988776655443',
      phoneNumber: '090-3333-7777',
      age: 26,
      gender: 'female',
      prefecture: '福岡県',
      totalPurchased: 2000,
      totalUsed: 1200,
      purchaseCount: 4,
      usageCount: 3,
      profileImageUrl: '',
      notes: '新規ユーザー。今後の利用動向を注視。'
    },
    {
      id: '5',
      name: '高橋健一',
      email: 'takahashi@example.com',
      registeredAt: '2025/07/28',
      balance: 150,
      status: 'active',
      lastLogin: '2025/08/09 22:15',
      lineUserId: 'U5566778899aabbcc5566778899aabbcc',
      phoneNumber: '080-1111-9999',
      age: 38,
      gender: 'male',
      prefecture: '愛知県',
      totalPurchased: 1500,
      totalUsed: 1350,
      purchaseCount: 2,
      usageCount: 4,
      profileImageUrl: '',
      notes: 'ライトユーザー。月1-2回程度の利用。'
    }
  ]);

  const [transactions] = useState<Transaction[]>([
    { id: '1', date: '2025/08/10 15:30', type: 'purchase', amount: 3000, description: 'クレジットカード購入', paymentMethod: 'Visa ****1234' },
    { id: '2', date: '2025/08/10 14:15', type: 'usage', amount: -500, description: '恋愛相談チャット', chatSession: 'CS001' },
    { id: '3', date: '2025/08/09 10:20', type: 'usage', amount: -300, description: '仕事運チャット', chatSession: 'CS002' },
    { id: '4', date: '2025/08/08 16:45', type: 'purchase', amount: 1000, description: 'クレジットカード購入', paymentMethod: 'JCB ****5678' },
    { id: '5', date: '2025/08/07 09:30', type: 'adjustment', amount: 100, description: 'システムエラー補償' },
    { id: '6', date: '2025/08/06 13:20', type: 'usage', amount: -500, description: '総合運勢チャット', chatSession: 'CS003' },
  ]);

  // フィルタリングとソート
  let filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.includes(searchQuery) ||
      (user.phoneNumber && user.phoneNumber.includes(searchQuery)) ||
      (user.lineUserId && user.lineUserId.includes(searchQuery));
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // ソート処理
  filteredUsers = filteredUsers.sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'registeredAt':
        aValue = new Date(a.registeredAt);
        bValue = new Date(b.registeredAt);
        break;
      case 'lastLogin':
        aValue = new Date(a.lastLogin);
        bValue = new Date(b.lastLogin);
        break;
      case 'balance':
        aValue = a.balance;
        bValue = b.balance;
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

  const handleToggleStatus = (userId: string, newStatus: 'active' | 'suspended') => {
    if (newStatus === 'suspended') {
      const user = users.find(u => u.id === userId);
      setSelectedUser(user || null);
      setShowSuspendModal(true);
    } else {
      // 即座に解除
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === userId 
          ? { ...user, status: 'active', suspensionReason: undefined, suspendedAt: undefined }
          : user
      ));
      alert(`ユーザーID: ${userId} のアカウントを有効化しました。`);
    }
  };

  const handleSuspendUser = () => {
    if (!selectedUser || !suspensionReason.trim()) {
      alert('停止理由を入力してください。');
      return;
    }

    setUsers(prevUsers => prevUsers.map(user => 
      user.id === selectedUser.id 
        ? { 
            ...user, 
            status: 'suspended', 
            suspensionReason: suspensionReason,
            suspendedAt: new Date().toLocaleString('ja-JP')
          }
        : user
    ));
    
    alert(`ユーザー「${selectedUser.name}」を停止しました。\n理由: ${suspensionReason}`);
    setShowSuspendModal(false);
    setSuspensionReason('');
    setSelectedUser(null);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      notes: user.notes || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!selectedUser || !editFormData.name.trim() || !editFormData.email.trim()) {
      alert('名前とメールアドレスは必須です。');
      return;
    }

    setUsers(prevUsers => prevUsers.map(user => 
      user.id === selectedUser.id 
        ? { 
            ...user, 
            name: editFormData.name,
            email: editFormData.email,
            phoneNumber: editFormData.phoneNumber || undefined,
            notes: editFormData.notes || undefined
          }
        : user
    ));
    
    alert(`ユーザー情報を更新しました。`);
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (!confirm('本当にこのユーザーを削除しますか？\n※この操作は取り消せません。')) {
      return;
    }
    
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    alert('ユーザーを削除しました。');
  };

  const handleExportCsv = () => {
    const csvData = [
      ['ID', '名前', 'メール', '電話番号', '登録日', '最終ログイン', 'ステータス', '残高', '累計購入', '累計利用', '備考'],
      ...filteredUsers.map(user => [
        user.id,
        user.name,
        user.email,
        user.phoneNumber || '',
        user.registeredAt,
        user.lastLogin,
        user.status === 'active' ? '有効' : '停止',
        user.balance,
        user.totalPurchased,
        user.totalUsed,
        user.notes || ''
      ])
    ];

    const csvContent = csvData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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

          {/* 統計情報 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 mb-1">総ユーザー数</div>
              <div className="text-2xl font-bold text-blue-900">{users.length}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 mb-1">有効ユーザー</div>
              <div className="text-2xl font-bold text-green-900">
                {users.filter(u => u.status === 'active').length}
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-sm text-red-600 mb-1">停止ユーザー</div>
              <div className="text-2xl font-bold text-red-900">
                {users.filter(u => u.status === 'suspended').length}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 mb-1">今日の新規登録</div>
              <div className="text-2xl font-bold text-purple-900">2</div>
            </div>
          </div>

          {/* 検索・フィルタ・操作エリア */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="名前・メール・ID・電話番号・LINE IDで検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-[300px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'suspended')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">全ステータス</option>
                <option value="active">有効のみ</option>
                <option value="suspended">停止のみ</option>
              </select>
              <button 
                onClick={handleExportCsv}
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                CSV出力
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">並び順:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                >
                  <option value="registeredAt">登録日</option>
                  <option value="lastLogin">最終ログイン</option>
                  <option value="name">名前</option>
                  <option value="balance">残高</option>
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
                {paginatedUsers.map((user) => (
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
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => handleShowDetail(user)}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          title="詳細を表示"
                        >
                          詳細
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          title="編集"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id, user.status === 'active' ? 'suspended' : 'active')}
                          className={`px-2 py-1 text-white text-xs rounded transition-colors ${
                            user.status === 'active'
                              ? 'bg-orange-600 hover:bg-orange-700'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                          title={user.status === 'active' ? 'アカウントを停止' : 'アカウントを有効化'}
                        >
                          {user.status === 'active' ? '停止' : '解除'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          title="ユーザーを削除"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
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
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                次へ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
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

            <div className="space-y-6">
              {/* 基本情報 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">基本情報</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">ユーザーID</label>
                    <p className="font-semibold font-mono text-sm">{selectedUser.id}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">LINE ユーザーID</label>
                    <p className="font-semibold font-mono text-xs break-all">{selectedUser.lineUserId}</p>
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
                    <label className="text-sm text-gray-600">電話番号</label>
                    <p className="font-semibold">{selectedUser.phoneNumber || '未設定'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">年齢・性別</label>
                    <p className="font-semibold">
                      {selectedUser.age ? `${selectedUser.age}歳` : '未設定'}
                      {selectedUser.gender && ` (${selectedUser.gender === 'male' ? '男性' : selectedUser.gender === 'female' ? '女性' : 'その他'})`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">都道府県</label>
                    <p className="font-semibold">{selectedUser.prefecture || '未設定'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">状態</label>
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedUser.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.status === 'active' ? '有効' : '停止'}
                      </span>
                      {selectedUser.status === 'suspended' && selectedUser.suspendedAt && (
                        <p className="text-xs text-red-600 mt-1">停止日時: {selectedUser.suspendedAt}</p>
                      )}
                      {selectedUser.suspensionReason && (
                        <p className="text-xs text-red-600 mt-1">理由: {selectedUser.suspensionReason}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* アカウント情報 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">アカウント情報</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">登録日</label>
                    <p className="font-semibold">{selectedUser.registeredAt}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">最終ログイン</label>
                    <p className="font-semibold">{selectedUser.lastLogin}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">現在のポイント残高</label>
                    <p className="font-semibold text-lg text-blue-600">
                      {selectedUser.balance.toLocaleString()} pt
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">累計購入ポイント</label>
                    <p className="font-semibold text-green-600">
                      {selectedUser.totalPurchased.toLocaleString()} pt
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">累計利用ポイント</label>
                    <p className="font-semibold text-red-600">
                      {selectedUser.totalUsed.toLocaleString()} pt
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">利用統計</label>
                    <p className="font-semibold">
                      購入{selectedUser.purchaseCount}回 / 利用{selectedUser.usageCount}回
                    </p>
                  </div>
                </div>
              </div>

              {/* 管理メモ */}
              {selectedUser.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2">管理メモ</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm">{selectedUser.notes}</p>
                  </div>
                </div>
              )}

              {/* 取引履歴 */}
              <div>
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">最近の取引履歴</h3>
                <div className="max-h-40 overflow-y-auto">
                  <div className="space-y-2">
                    {transactions.filter(t => Math.random() > 0.3).slice(0, 5).map((transaction, index) => (
                      <div key={index} className="flex justify-between py-2 px-3 bg-gray-50 rounded text-sm">
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-xs text-gray-600">{transaction.date}</div>
                          {transaction.paymentMethod && (
                            <div className="text-xs text-gray-600">{transaction.paymentMethod}</div>
                          )}
                        </div>
                        <div className={`font-semibold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} pt
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  閉じる
                </button>
                <button 
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEditUser(selectedUser);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  編集
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ユーザー情報編集</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">対象ユーザー</label>
                <p className="font-semibold">{selectedUser.name} (ID: {selectedUser.id})</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">名前 *</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">メールアドレス *</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">電話番号</label>
                <input
                  type="tel"
                  value={editFormData.phoneNumber}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="090-1234-5678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">管理メモ</label>
                <textarea
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="管理用のメモを入力..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">アカウント停止</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">対象ユーザー</label>
                <p className="font-semibold">{selectedUser.name} (ID: {selectedUser.id})</p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="text-sm text-yellow-800">
                  <strong>注意:</strong> このユーザーのアカウントを停止します。停止されたユーザーはサービスを利用できなくなります。
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">停止理由 *</label>
                <textarea
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  rows={3}
                  placeholder="停止理由を詳しく入力してください..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowSuspendModal(false);
                    setSuspensionReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSuspendUser}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  停止実行
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}