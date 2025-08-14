'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LineContainer from '@/components/LineContainer';

interface Message {
  id: string;
  sender: 'user' | 'fortune_teller';
  message: string;
  timestamp: string;
  type?: 'text' | 'typing' | 'system';
}

interface FortuneTeller {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  isOnline: boolean;
  image: string;
  pricePerMinute: number;
  description: string;
}

export default function ChatPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedFortuneTeller, setSelectedFortuneTeller] = useState<FortuneTeller | null>(null);
  const [showFortuneTellerList, setShowFortuneTellerList] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatStartTime, setChatStartTime] = useState<Date | null>(null);
  const [chatDuration, setChatDuration] = useState(0);
  const [showEndChatConfirm, setShowEndChatConfirm] = useState(false);

  const [fortuneTellers] = useState<FortuneTeller[]>([
    {
      id: '1',
      name: '桜井先生',
      specialty: '恋愛・人間関係',
      experience: '15年',
      rating: 4.8,
      isOnline: true,
      image: '🌸',
      pricePerMinute: 20,
      description: '恋愛問題を中心に、人間関係の悩みを解決します。タロットカードと霊感を使った鑑定が得意です。'
    },
    {
      id: '2',
      name: '田中先生',
      specialty: '仕事・キャリア',
      experience: '12年',
      rating: 4.6,
      isOnline: true,
      image: '⭐',
      pricePerMinute: 25,
      description: '転職や昇進、職場の人間関係など、キャリアに関する悩みを専門としています。'
    },
    {
      id: '3',
      name: '山田先生',
      specialty: '健康・家族',
      experience: '20年',
      rating: 4.9,
      isOnline: false,
      image: '🍀',
      pricePerMinute: 18,
      description: '健康運や家族関係を中心に、生活全般のアドバイスを行います。'
    },
    {
      id: '4',
      name: '佐藤先生',
      specialty: '金運・投資',
      experience: '8年',
      rating: 4.4,
      isOnline: true,
      image: '💰',
      pricePerMinute: 30,
      description: '金運向上や投資のタイミング、お金に関する悩みを解決します。'
    }
  ]);

  useEffect(() => {
    // LocalStorageからユーザー情報を取得
    const storedAuth = localStorage.getItem('demo-auth');
    if (storedAuth) {
      setUser(JSON.parse(storedAuth));
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (chatStartTime) {
      interval = setInterval(() => {
        setChatDuration(Math.floor((Date.now() - chatStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [chatStartTime]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startChat = (fortuneTeller: FortuneTeller) => {
    if (user.balance < fortuneTeller.pricePerMinute) {
      alert('ポイントが不足しています。ポイントを購入してください。');
      return;
    }

    setSelectedFortuneTeller(fortuneTeller);
    setShowFortuneTellerList(false);
    setChatStartTime(new Date());
    
    // 開始メッセージ
    const startMessage: Message = {
      id: Date.now().toString(),
      sender: 'fortune_teller',
      message: `こんにちは！${fortuneTeller.name}です。${fortuneTeller.specialty}の鑑定を承ります。どのようなことでお悩みでしょうか？`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'text'
    };
    
    setMessages([startMessage]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedFortuneTeller) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      message: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // タイピング表示
    const typingMessage: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'fortune_teller',
      message: '入力中...',
      timestamp: new Date().toLocaleTimeString(),
      type: 'typing'
    };
    
    setMessages(prev => [...prev, typingMessage]);

    // 2-4秒後に返事
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.type !== 'typing'));
      
      const responses = [
        'なるほど、とてもよく分かります。カードに聞いてみますね...',
        'そのお悩み、多くの方が抱えていらっしゃいます。霊感で見てみると...',
        'とても興味深いですね。あなたの運気の流れを見させていただくと...',
        'そのような状況でしたら、まず大切なのは...',
        'カードが教えてくれています。あなたには...',
        '深いお悩みですね。スピリチュアルな視点から見ると...'
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      
      const fortuneTellerMessage: Message = {
        id: (Date.now() + 2).toString(),
        sender: 'fortune_teller',
        message: response,
        timestamp: new Date().toLocaleTimeString(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, fortuneTellerMessage]);
      setIsTyping(false);
    }, Math.random() * 2000 + 2000);
  };

  const endChat = () => {
    if (!selectedFortuneTeller || !chatStartTime) return;

    const durationMinutes = Math.ceil(chatDuration / 60);
    const cost = durationMinutes * selectedFortuneTeller.pricePerMinute;
    const newBalance = Math.max(0, user.balance - cost);

    // LocalStorageのユーザー残高を更新
    const updatedUser = { ...user, balance: newBalance };
    localStorage.setItem('demo-auth', JSON.stringify(updatedUser));
    setUser(updatedUser);

    alert(`チャット終了\n\n時間: ${durationMinutes}分\n消費ポイント: ${cost}pt\n残高: ${newBalance}pt\n\nありがとうございました！`);
    
    // ダッシュボードに戻る
    router.push('/dashboard');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return (
      <LineContainer>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="text-gray-700 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {selectedFortuneTeller ? selectedFortuneTeller.name : '占いチャット'}
                </h1>
                {selectedFortuneTeller && (
                  <p className="text-sm text-gray-700">{selectedFortuneTeller.specialty}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600 font-medium">{user.balance.toLocaleString()} pt</div>
              {chatStartTime && (
                <div className="text-xs text-gray-700">
                  {formatTime(chatDuration)} • -{Math.ceil(chatDuration / 60) * (selectedFortuneTeller?.pricePerMinute || 0)}pt
                </div>
              )}
            </div>
          </div>
        </div>

        {/* コンテンツ */}
        {showFortuneTellerList ? (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">占い師を選択</h2>
              <p className="text-sm text-gray-700">お悩みに応じて最適な占い師をお選びください</p>
            </div>

            <div className="space-y-4">
              {fortuneTellers.map((fortuneTeller) => (
                <div
                  key={fortuneTeller.id}
                  className={`bg-white border border-gray-200 rounded-lg p-4 ${
                    fortuneTeller.isOnline 
                      ? 'cursor-pointer hover:border-purple-300 hover:shadow-md transition-all'
                      : 'opacity-60'
                  }`}
                  onClick={() => fortuneTeller.isOnline && startChat(fortuneTeller)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{fortuneTeller.image}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-gray-900">{fortuneTeller.name}</h3>
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span className="text-sm text-gray-700">{fortuneTeller.rating}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          fortuneTeller.isOnline 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {fortuneTeller.isOnline ? 'オンライン' : 'オフライン'}
                        </span>
                      </div>
                      
                      <div className="mb-2">
                        <span className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded mr-2">
                          {fortuneTeller.specialty}
                        </span>
                        <span className="text-sm text-gray-700">経験{fortuneTeller.experience}</span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">{fortuneTeller.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-purple-600">
                          {fortuneTeller.pricePerMinute}pt/分
                        </div>
                        {fortuneTeller.isOnline && (
                          <div className="text-sm text-green-600">
                            今すぐ相談可能
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            {/* チャットメッセージ */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-purple-600 text-white'
                      : message.type === 'typing'
                      ? 'bg-gray-200 text-gray-700 italic'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-purple-200' : 'text-gray-700'
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* 入力エリア */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="メッセージを入力..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none placeholder:text-gray-500"
                  disabled={isTyping}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  送信
                </button>
              </div>
              <div className="flex justify-center mt-3">
                <button
                  onClick={() => setShowEndChatConfirm(true)}
                  className="px-6 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  チャット終了
                </button>
              </div>
            </div>
          </div>
        )}

        {/* チャット終了確認モーダル */}
        {showEndChatConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-sm w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">チャット終了</h2>
              <div className="space-y-2 mb-6">
                <p className="text-sm text-gray-700">
                  経過時間: {formatTime(chatDuration)}
                </p>
                <p className="text-sm text-gray-700">
                  消費予定ポイント: {Math.ceil(chatDuration / 60) * (selectedFortuneTeller?.pricePerMinute || 0)}pt
                </p>
                <p className="text-sm text-gray-700">
                  残高: {user.balance - Math.ceil(chatDuration / 60) * (selectedFortuneTeller?.pricePerMinute || 0)}pt
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndChatConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  続ける
                </button>
                <button
                  onClick={endChat}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  終了
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LineContainer>
  );
}