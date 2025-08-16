'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/AdminNav';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  totalPoints: number;
  todayRevenue: number;
  todayNewUsers: number;
  monthlyRevenue: number;
  monthlyNewUsers: number;
  recentTransactions: {
    id: string;
    user: string;
    type: string;
    amount: number;
    createdAt: string;
  }[];
  userGrowth: {
    date: string;
    count: number;
  }[];
  revenueGrowth: {
    date: string;
    amount: number;
  }[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchDashboardStats();
    }
  }, [timeRange, loading]);

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
      
      setLoading(false);
      
    } catch (error) {
      console.error('Admin auth check error:', error);
      router.push('/admin/login');
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setError(null);
      
      const response = await fetch(`/api/admin/stats?range=${timeRange}`, {
        credentials: 'include',
      });
      
      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      setStats(data);
      
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('統計データの取得に失敗しました');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchDashboardStats()}
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
    <div className="min-h-screen bg-gray-100">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 期間選択 */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">ビジネス統計</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                timeRange === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              週間
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                timeRange === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              月間
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                timeRange === 'year'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              年間
            </button>
          </div>
        </div>

        {/* KPIカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">総ユーザー数</h3>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalUsers.toLocaleString() || 0}
            </div>
            <div className="text-sm text-green-600 mt-1">
              +{stats?.todayNewUsers || 0} 今日
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">月間売上</h3>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats?.monthlyRevenue || 0)}
            </div>
            <div className="text-sm text-green-600 mt-1">
              +{formatCurrency(stats?.todayRevenue || 0)} 今日
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">アクティブユーザー</h3>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.activeUsers.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              過去30日間
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">総ポイント残高</h3>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalPoints.toLocaleString() || 0} pt
            </div>
            <div className="text-sm text-gray-600 mt-1">
              全ユーザー合計
            </div>
          </div>
        </div>

        {/* グラフエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">ユーザー増加推移</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {stats?.userGrowth.map((data, index) => {
                const maxCount = Math.max(...(stats?.userGrowth.map(d => d.count) || [1]));
                const height = (data.count / maxCount) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors relative group"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {data.count}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-2 -rotate-45 origin-left">
                      {new Date(data.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">売上推移</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {stats?.revenueGrowth.map((data, index) => {
                const maxAmount = Math.max(...(stats?.revenueGrowth.map(d => d.amount) || [1]));
                const height = (data.amount / maxAmount) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-colors relative group"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {formatCurrency(data.amount)}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-2 -rotate-45 origin-left">
                      {new Date(data.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 最近の取引 */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">最近の取引</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">ユーザー</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">タイプ</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">金額</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">日時</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats?.recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="py-3 text-sm text-gray-900">{transaction.user}</td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.type === 'PURCHASE' ? 'bg-green-100 text-green-800' :
                        transaction.type === 'USAGE' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.type === 'PURCHASE' ? '購入' :
                         transaction.type === 'USAGE' ? '利用' :
                         transaction.type}
                      </span>
                    </td>
                    <td className={`py-3 text-sm font-medium ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} pt
                    </td>
                    <td className="py-3 text-sm text-gray-600">{formatDate(transaction.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}