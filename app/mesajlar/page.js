"use client";
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Download, X, Eye, Clock } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const handleLogin = () => {
    if (password === "19105887638") {
      setIsAuthenticated(true);
      fetchMessages();
    } else {
      alert("Falsches Passwort! ⛔");
    }
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setMessages(data);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Admin Zugang</h2>
          <p className="text-gray-400 mb-6 text-sm">Bitte Passwort eingeben um Nachrichten zu sehen</p>
          <input 
            type="password" 
            placeholder="Passwort" 
            className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-500 text-center text-lg focus:outline-none focus:border-pink-500 transition-all mb-4"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin} className="w-full bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-2xl font-bold transition-all active:scale-95">
            Öffnen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 pb-20">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8 pt-4">
          <h1 className="text-2xl font-black text-gray-900">Posteingang</h1>
          <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full">
            {messages.length} Nachrichten
          </span>
        </div>
        
        <div className="space-y-3">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              onClick={() => setSelectedMessage(msg.content)}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 active:scale-98 transition-transform cursor-pointer group hover:shadow-md"
            >
              <p className="text-gray-800 font-medium line-clamp-2">{msg.content}</p>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                  <Clock size={10} />
                  {new Date(msg.created_at).toLocaleDateString('de-DE')}
                </span>
                <span className="text-pink-600 text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye size={12} /> Story ansehen
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INSTAGRAM STORY MODU (POPUP) */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center sm:p-4">
          <div className="relative w-full h-full sm:h-auto sm:max-w-sm sm:aspect-[9/16] bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] sm:rounded-3xl flex flex-col items-center justify-center p-8">
            
            {/* Kapatma Butonu */}
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedMessage(null); }}
              className="absolute top-6 right-6 bg-black/20 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/40 z-20"
            >
              <X size={24} />
            </button>

            {/* Mesaj Kartı */}
            <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl w-full text-center transform transition-all hover:scale-[1.02]">
              <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-violet-500 rounded-full mx-auto -mt-16 border-4 border-white shadow-lg flex items-center justify-center text-2xl">
                🤫
              </div>
              <h3 className="font-bold text-gray-400 text-xs tracking-widest uppercase mt-3 mb-4">Anonyme Nachricht</h3>
              <p className="text-gray-900 text-xl sm:text-2xl font-black leading-snug break-words">
                "{selectedMessage}"
              </p>
            </div>

            <div className="absolute bottom-12 flex flex-col items-center animate-bounce">
              <p className="text-white/80 text-sm font-medium bg-black/20 px-4 py-2 rounded-full backdrop-blur-md">
                 📸 Screenshot machen
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}