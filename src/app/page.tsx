<<<<<<< HEAD
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">占いの小窓</h1>
              <span className="ml-2 text-sm text-gray-800">| あなたの毎日に小さな光を</span>
            </div>
            <nav className="flex space-x-4">
              <Link href="/login" className="text-gray-800 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium">
                ユーザーログイン
              </Link>
              <Link href="/admin/login" className="text-gray-800 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium">
                管理者
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヒーローセクション */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            LINE公式アカウント有料チャットシステム
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            占い師とのチャット相談をポイント制で提供
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push('/login')}
              className="bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 transition-colors"
            >
              サービスを始める
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-white text-purple-600 font-bold py-3 px-8 rounded-lg border-2 border-purple-600 hover:bg-purple-50 transition-colors"
            >
              デモを見る
            </button>
          </div>
        </div>

        {/* 機能カード */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">ユーザー機能</h3>
            <ul className="text-sm text-gray-800 space-y-2">
              <li>✓ LINEログイン認証</li>
              <li>✓ ポイント購入（Stripe決済）</li>
              <li>✓ 残高・履歴管理</li>
              <li>✓ 占いチャット利用</li>
            </ul>
            <Link href="/login" className="inline-block mt-4 text-purple-600 hover:text-purple-700 font-semibold">
              ログイン画面へ →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">管理機能</h3>
            <ul className="text-sm text-gray-800 space-y-2">
              <li>✓ ユーザー管理</li>
              <li>✓ ポイント管理</li>
              <li>✓ アカウント凍結/解除</li>
              <li>✓ 取引履歴確認</li>
            </ul>
            <Link href="/admin/login" className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-semibold">
              管理画面へ →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">決済システム</h3>
            <ul className="text-sm text-gray-800 space-y-2">
              <li>✓ Stripe統合</li>
              <li>✓ 安全な決済処理</li>
              <li>✓ ポイント自動付与</li>
              <li>✓ 購入履歴管理</li>
            </ul>
            <Link href="/points/purchase" className="inline-block mt-4 text-green-600 hover:text-green-700 font-semibold">
              購入画面へ →
            </Link>
          </div>
        </div>

        {/* クイックリンク */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">クイックアクセス</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">ユーザー画面</h4>
              <div className="space-y-2">
                <Link href="/login" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-purple-600">→</span> LINEログイン
                </Link>
                <Link href="/dashboard" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-purple-600">→</span> マイページ（デモ）
                </Link>
                <Link href="/points/purchase" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-purple-600">→</span> ポイント購入
                </Link>
                <Link href="/chat" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-purple-600">→</span> 占いチャット（デモ）
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">管理画面</h4>
              <div className="space-y-2">
                <Link href="/admin/login" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-blue-600">→</span> 管理者ログイン
                </Link>
                <Link href="/admin/users" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-blue-600">→</span> ユーザー管理（デモ）
                </Link>
                <Link href="/admin/points" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-blue-600">→</span> ポイント管理（デモ）
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ステータス */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">デモモード</h3>
          <p className="text-yellow-700">
            現在はデモモードで動作しています。実際の決済やLINE認証を行うには、環境変数の設定が必要です。
          </p>
          <div className="mt-4 text-sm text-yellow-600">
            <p>必要な設定:</p>
            <ul className="list-disc list-inside mt-2">
              <li>LINE Developers - Channel ID & Secret</li>
              <li>Stripe API Keys</li>
              <li>JWT Secret Key</li>
            </ul>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white mt-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-700 text-sm">
            <p>© 2025 占いの小窓 - LINE公式アカウント有料チャットシステム</p>
            <p className="mt-2">Powered by Next.js, TypeScript, Tailwind CSS</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
=======
import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
              src/app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
>>>>>>> 1dcfe17880d6c3c99c4bdce410965f224500cc3d
