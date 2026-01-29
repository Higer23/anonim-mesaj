"use client";
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import toast, { Toaster } from 'react-hot-toast';
import { Send, Lock, Zap } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sendAnonMessage = async () => {
    if (!message.trim()) return toast.error("Bitte gib eine Nachricht ein! 😠"); // Boş mesaj hatası
    setLoading(true);
    
    const { error } = await supabase
      .from('messages')
      .insert([{ content: message }]);

    if (error) {
      toast.error("Fehler beim Senden! ❌");
    } else {
      toast.success("Nachricht anonym gesendet! 🚀");
      setMessage('');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#8EC5FC] to-[#E0C3FC] flex items-center justify-center p-4 font-sans">
      <Toaster position="top-center" />
      
      <div className="bg-white/80 backdrop-blur-xl w-full max-w-md rounded-[2rem] shadow-2xl border border-white/50 p-6 sm:p-8 text-center transition-all animate-fade-in-up">
        
        {/* Avatar Alanı */}
        <div className="relative w-28 h-28 mx-auto -mt-20 mb-4">
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-violet-500 rounded-full blur-md opacity-60 animate-pulse"></div>
          <img 
            src="https://api.dicebear.com/9.x/avataaars/svg?seed=Felix" 
            alt="avatar" 
            className="relative w-full h-full rounded-full border-4 border-white shadow-lg object-cover bg-gray-100"
          />
          <div className="absolute bottom-1 right-1 bg-green-400 w-5 h-5 rounded-full border-4 border-white"></div>
        </div>

        <h1 className="text-2xl font-black text-gray-800 mb-1">@dein_benutzername</h1>
        <p className="text-gray-500 text-sm font-medium mb-6 bg-white/50 inline-block px-4 py-1 rounded-full">
          Schick mir anonyme Nachrichten! 🤫
        </p>

        <div className="relative group">
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Was wolltest du mir schon immer sagen?..."
            className="w-full h-44 bg-white border-2 border-indigo-100 rounded-3xl p-5 text-gray-700 placeholder-gray-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all resize-none shadow-inner text-base"
          />
          <div className="absolute bottom-4 right-4 text-gray-300 pointer-events-none">
            <Send size={20} />
          </div>
        </div>

        <button 
          onClick={sendAnonMessage}
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold py-4 rounded-2xl mt-6 shadow-xl shadow-pink-200 active:scale-95 transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="animate-pulse">Senden...</span>
          ) : (
            <>
              ANONYM SENDEN <Zap size={20} fill="currentColor" />
            </>
          )}
        </button>

        <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-gray-400 font-bold tracking-widest uppercase opacity-60">
          <Lock size={12} />
          <span>100% Anonym & Sicher</span>
        </div>
      </div>
    </main>
  );
}