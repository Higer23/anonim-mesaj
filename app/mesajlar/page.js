"use client";
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toPng } from 'html-to-image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, X, Eye, Clock, Trash2, Lock, Unlock, MessageSquare, 
  RefreshCw, Sparkles, Palette, Check, Trash
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTheme, setActiveTheme] = useState(0);
  const storyRef = useRef(null);

  const themes = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #5ee7df 0%, #b490d1 100%)",
    "linear-gradient(135deg, #c31432 0%, #240b36 100%)",
    "linear-gradient(135deg, #000000 0%, #434343 100%)",
  ];

  const handleLogin = () => {
    if (password === "19105887638") {
      setIsAuthenticated(true);
      fetchMessages();
      toast.success("Willkommen zurück!");
    } else {
      toast.error("Falsches Passwort!");
    }
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setMessages(data);
    if (error) toast.error("Fehler beim Laden.");
  };

  const deleteMessage = async (id) => {
    if (!confirm("Diese Nachricht wirklich löschen?")) return;

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Fehler beim Löschen.");
    } else {
      toast.success("Gelöscht!");
      setMessages(messages.filter(m => m.id !== id));
      setSelectedMessage(null);
    }
  };

  const downloadStory = async () => {
    if (!storyRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(storyRef.current, { quality: 1, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `story-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Bild gespeichert!");
    } catch (err) {
      toast.error("Fehler beim Erstellen.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 font-sans">
        <Toaster />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 text-center shadow-2xl">
            <div className="w-20 h-20 bg-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
              <Lock className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Admin Login</h2>
            <p className="text-gray-400 text-sm mb-8 font-medium">Posteingang verschlüsselt 🔒</p>
            <input 
              type="password" 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white text-center text-xl mb-4 outline-none focus:border-indigo-500 transition-all"
              placeholder="••••••••"
            />
            <button onClick={handleLogin} className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-indigo-50 transition-all active:scale-95">
              EINTRETEN
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <Toaster />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Posteingang</h1>
            <p className="text-gray-500 font-medium mt-1">Du hast {messages.length} anonyme Nachrichten</p>
          </div>
          <button onClick={fetchMessages} className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all text-gray-600">
            <RefreshCw size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {messages.map((msg) => (
            <motion.div 
              key={String(msg.id)}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedMessage(msg)}
              className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 cursor-pointer group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                  <MessageSquare size={20} />
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash size={18} />
                </button>
              </div>
              <p className="text-gray-800 text-lg font-bold leading-relaxed line-clamp-3">
                "{msg.content}"
              </p>
              <div className="mt-4 flex items-center gap-2 text-gray-400 text-xs font-bold">
                <Clock size={12} />
                {new Date(msg.created_at).toLocaleDateString('de-DE')}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* STORY MODAL */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <div className="w-full max-w-lg flex flex-col gap-4">
              <div 
                ref={storyRef}
                style={{ background: themes[activeTheme] }}
                className="aspect-[9/16] w-full rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl"
              >
                <div className="absolute top-12 left-12 flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <Sparkles size={16} className="text-white" />
                  <span className="text-white text-xs font-black tracking-widest uppercase">Anonym</span>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[3rem] w-full shadow-2xl transform rotate-1">
                   <p className="text-white text-3xl font-black leading-tight drop-shadow-lg italic">
                    "{selectedMessage.content}"
                  </p>
                </div>

                <div className="absolute bottom-12 flex flex-col items-center">
                   <div className="bg-white text-black px-6 py-2 rounded-full font-black text-xs tracking-tighter shadow-xl">
                      ANONIM-MESAJ-THREE
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={downloadStory} disabled={isDownloading} className="bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all">
                  {isDownloading ? <RefreshCw className="animate-spin" /> : <Download />} ALS BILD
                </button>
                <button onClick={() => setActiveTheme((activeTheme + 1) % themes.length)} className="bg-indigo-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all">
                  <Palette /> THEME
                </button>
                <button onClick={() => setSelectedMessage(null)} className="col-span-2 bg-white/10 text-white font-bold py-3 rounded-2xl hover:bg-white/20 transition-all">
                  Schließen
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}