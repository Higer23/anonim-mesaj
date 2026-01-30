"use client";
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toPng } from 'html-to-image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  X, 
  Eye, 
  Clock, 
  Trash2, 
  Lock, 
  Unlock,
  MessageSquare,
  TrendingUp,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Image as ImageIcon,
  Sparkles,
  Heart,
  Star,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Activity,
  Zap,
  Crown,
  Shield,
  Inbox,
  Archive,
  ChevronDown,
  Grid,
  List,
  Settings,
  Moon,
  Sun,
  Palette,
  Check
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // all, today, week, month
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [storyTheme, setStoryTheme] = useState('gradient1'); // gradient1, gradient2, solid, minimal
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    week: 0,
    month: 0
  });
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  const storyRef = useRef(null);

  // Story Themes
  const storyThemes = {
    gradient1: {
      name: 'Sunset Vibes',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      icon: '🌅'
    },
    gradient2: {
      name: 'Ocean Dream',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      icon: '🌊'
    },
    gradient3: {
      name: 'Fire Energy',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      icon: '🔥'
    },
    gradient4: {
      name: 'Aurora',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      icon: '✨'
    },
    gradient5: {
      name: 'Candy Pop',
      gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      icon: '🍭'
    },
    minimal: {
      name: 'Minimal',
      gradient: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
      icon: '⚪'
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    calculateStats();
  }, [messages]);

  const handleLogin = () => {
    if (password === "19105887638") {
      setIsAuthenticated(true);
      toast.success('Willkommen zurück! 👋', {
        icon: '🔓',
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
          fontWeight: 'bold'
        }
      });
      fetchMessages();
    } else {
      toast.error('Falsches Passwort! ⛔', {
        style: {
          borderRadius: '12px',
          background: '#ef4444',
          color: '#fff',
          fontWeight: 'bold'
        }
      });
    }
  };

  const fetchMessages = async () => {
    setIsRefreshing(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setMessages(data);
      toast.success(`${data.length} Nachrichten geladen! 📬`);
    }
    if (error) {
      toast.error('Fehler beim Laden! ❌');
    }
    setIsRefreshing(false);
  };

  const deleteMessage = async (id, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Diese Nachricht wirklich löschen?')) return;
    
    setDeletingId(id);
    
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Fehler beim Löschen! ❌', {
        style: {
          borderRadius: '12px',
          background: '#ef4444',
          color: '#fff',
        }
      });
    } else {
      toast.success('Nachricht gelöscht! 🗑️', {
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
        }
      });
      setMessages(messages.filter(m => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    }
    
    setDeletingId(null);
  };

  const downloadStory = async () => {
    if (!storyRef.current) return;
    
    setIsDownloading(true);
    toast.loading('Story wird erstellt... 🎨', { id: 'download' });

    try {
      const dataUrl = await toPng(storyRef.current, {
        quality: 1.0,
        pixelRatio: 3,
        width: 1080,
        height: 1920,
        cacheBust: true,
        backgroundColor: 'transparent'
      });

      const link = document.createElement('a');
      link.download = `anonym-story-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      toast.success('Story heruntergeladen! 🎉', { 
        id: 'download',
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
          fontWeight: 'bold'
        }
      });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download fehlgeschlagen! 😕', { 
        id: 'download',
        style: {
          borderRadius: '12px',
          background: '#ef4444',
          color: '#fff',
        }
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const calculateStats = () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    setStats({
      total: messages.length,
      today: messages.filter(m => new Date(m.created_at) >= todayStart).length,
      week: messages.filter(m => new Date(m.created_at) >= weekStart).length,
      month: messages.filter(m => new Date(m.created_at) >= monthStart).length
    });
  };

  const getFilteredMessages = () => {
    let filtered = [...messages];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(m => 
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Time filter
    const now = new Date();
    switch(filterMode) {
      case 'today':
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filtered = filtered.filter(m => new Date(m.created_at) >= todayStart);
        break;
      case 'week':
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(m => new Date(m.created_at) >= weekStart);
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = filtered.filter(m => new Date(m.created_at) >= monthStart);
        break;
    }

    return filtered;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <Toaster position="top-center" />
        
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </div>

        <motion.div 
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Lock Icon */}
          <motion.div 
            className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-2xl"
            animate={{
              boxShadow: [
                '0 0 20px rgba(168, 85, 247, 0.4)',
                '0 0 40px rgba(236, 72, 153, 0.6)',
                '0 0 20px rgba(168, 85, 247, 0.4)',
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <Lock size={40} className="text-white" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-purple-200 text-sm font-medium">
              Secure access • Encrypted connection
            </p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="space-y-6">
              {/* Password Input */}
              <div>
                <label className="block text-white/80 text-sm font-bold mb-3">
                  Passwort eingeben
                </label>
                <input 
                  type="password" 
                  placeholder="••••••••••" 
                  className="w-full p-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/40 text-center text-lg font-bold focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all backdrop-blur-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoFocus
                />
              </div>

              {/* Login Button */}
              <motion.button 
                onClick={handleLogin} 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-lg shadow-purple-500/50 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Unlock size={20} />
                Entsperren
              </motion.button>
            </div>

            {/* Security Info */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center gap-2 text-white/60 text-xs font-bold">
                <Shield size={14} />
                <span>256-bit Verschlüsselung</span>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-white/40 text-xs font-medium">
              Protected by Supabase Security
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const filteredMessages = getFilteredMessages();

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-xl bg-white/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Crown size={20} className="text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-black text-gray-900">Dashboard</h1>
                <p className="text-xs text-gray-500 font-medium">Admin Panel</p>
              </div>
            </div>

            <motion.button
              onClick={fetchMessages}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isRefreshing}
            >
              <motion.div
                animate={isRefreshing ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
              >
                <RefreshCw size={18} className="text-gray-700" />
              </motion.div>
            </motion.button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <motion.div 
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <Inbox size={20} className="opacity-80" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles size={16} />
                </motion.div>
              </div>
              <p className="text-3xl font-black mb-1">{stats.total}</p>
              <p className="text-xs font-bold opacity-80">Gesamt</p>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-4 text-white shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <Activity size={20} className="opacity-80" />
                <Zap size={16} className="text-yellow-300" />
              </div>
              <p className="text-3xl font-black mb-1">{stats.today}</p>
              <p className="text-xs font-bold opacity-80">Heute</p>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={20} className="opacity-80" />
                <Calendar size={16} className="opacity-60" />
              </div>
              <p className="text-3xl font-black mb-1">{stats.week}</p>
              <p className="text-xs font-bold opacity-80">7 Tage</p>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <BarChart3 size={20} className="opacity-80" />
                <Star size={16} className="text-yellow-300" fill="currentColor" />
              </div>
              <p className="text-3xl font-black mb-1">{stats.month}</p>
              <p className="text-xs font-bold opacity-80">30 Tage</p>
            </motion.div>
          </div>

          {/* Search & Filters */}
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Nachrichten durchsuchen..."
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white transition-all font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <motion.button
                onClick={() => setFilterMode('all')}
                className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  filterMode === 'all'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Alle
              </motion.button>

              <motion.button
                onClick={() => setFilterMode('today')}
                className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  filterMode === 'today'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Heute
              </motion.button>

              <motion.button
                onClick={() => setFilterMode('week')}
                className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  filterMode === 'week'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Diese Woche
              </motion.button>

              <motion.button
                onClick={() => setFilterMode('month')}
                className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  filterMode === 'month'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Dieser Monat
              </motion.button>

              <div className="flex-1" />

              <motion.button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {filteredMessages.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Keine Nachrichten gefunden</h3>
            <p className="text-gray-500 text-sm">
              {searchQuery ? 'Versuche einen anderen Suchbegriff' : 'Warte auf neue Nachrichten'}
            </p>
          </motion.div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            <AnimatePresence>
              {filteredMessages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <motion.div
                    onClick={() => setSelectedMessage(msg)}
                    className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                    whileHover={{ y: -4 }}
                  >
                    {/* Card Header */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <MessageSquare size={16} className="text-white" />
                          </div>
                          <span className="text-xs font-bold text-gray-400">
                            #{msg.id.slice(0, 8)}
                          </span>
                        </div>

                        <motion.button
                          onClick={(e) => deleteMessage(msg.id, e)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          disabled={deletingId === msg.id}
                        >
                          {deletingId === msg.id ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              <RefreshCw size={14} className="text-red-600" />
                            </motion.div>
                          ) : (
                            <Trash2 size={14} className="text-red-600" />
                          )}
                        </motion.button>
                      </div>

                      {/* Message Content */}
                      <p className="text-gray-800 font-medium leading-relaxed line-clamp-3 mb-4">
                        {msg.content}
                      </p>

                      {/* Card Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Clock size={12} />
                          <span className="text-xs font-bold">
                            {new Date(msg.created_at).toLocaleDateString('de-DE', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye size={12} />
                          <span className="text-xs font-bold">Story ansehen</span>
                        </div>
                      </div>
                    </div>

                    {/* Hover Gradient */}
                    <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Instagram Story Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMessage(null)}
          >
            <motion.div
              className="relative w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Control Panel */}
              <div className="absolute -top-16 left-0 right-0 flex items-center justify-between px-4">
                <motion.button
                  onClick={() => setShowThemeSelector(!showThemeSelector)}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-xl text-white px-4 py-2.5 rounded-xl font-bold text-sm border border-white/20 hover:bg-white/20 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Palette size={16} />
                  Theme
                </motion.button>

                <motion.button
                  onClick={() => setSelectedMessage(null)}
                  className="p-2.5 bg-white/10 backdrop-blur-xl text-white rounded-xl hover:bg-white/20 transition-all border border-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Theme Selector */}
              <AnimatePresence>
                {showThemeSelector && (
                  <motion.div
                    className="absolute -top-32 left-0 right-0 bg-white/10 backdrop-blur-2xl rounded-2xl p-3 border border-white/20 mb-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(storyThemes).map(([key, theme]) => (
                        <motion.button
                          key={key}
                          onClick={() => {
                            setStoryTheme(key);
                            setShowThemeSelector(false);
                          }}
                          className="relative p-3 rounded-xl border-2 transition-all"
                          style={{
                            background: theme.gradient,
                            borderColor: storyTheme === key ? '#fff' : 'transparent'
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="text-2xl mb-1">{theme.icon}</div>
                          <div className="text-white text-xs font-bold">{theme.name}</div>
                          {storyTheme === key && (
                            <motion.div
                              className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <Check size={12} className="text-purple-600" />
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Story Preview (for download) */}
              <div 
                ref={storyRef}
                className="w-[1080px] h-[1920px] absolute left-[-9999px]"
                style={{ background: storyThemes[storyTheme].gradient }}
              >
                <div className="w-full h-full flex flex-col items-center justify-center p-20">
                  {/* Top Badge */}
                  <div className="bg-white/20 backdrop-blur-xl px-8 py-4 rounded-3xl border-4 border-white/30 mb-12">
                    <p className="text-white/90 text-3xl font-black tracking-wider uppercase">
                      Anonyme Nachricht
                    </p>
                  </div>

                  {/* Message Card */}
                  <div className="bg-white rounded-[4rem] p-20 shadow-2xl w-full max-w-4xl">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto -mt-32 border-8 border-white shadow-2xl flex items-center justify-center text-6xl mb-12">
                      🤫
                    </div>

                    <p className="text-gray-900 text-5xl font-black leading-tight text-center break-words px-8">
                      "{selectedMessage.content}"
                    </p>
                  </div>

                  {/* Bottom Info */}
                  <div className="mt-12 flex items-center gap-4 bg-white/20 backdrop-blur-xl px-8 py-4 rounded-3xl border-4 border-white/30">
                    <Lock size={32} className="text-white" />
                    <p className="text-white text-2xl font-black">
                      100% Anonym
                    </p>
                  </div>

                  {/* Watermark */}
                  <div className="absolute bottom-16 left-0 right-0 text-center">
                    <p className="text-white/40 text-2xl font-bold">
                      @dein_benutzername
                    </p>
                  </div>
                </div>
              </div>

              {/* Visible Story */}
              <div 
                className="w-full aspect-[9/16] rounded-3xl shadow-2xl overflow-hidden"
                style={{ background: storyThemes[storyTheme].gradient }}
              >
                <div className="w-full h-full flex flex-col items-center justify-center p-8">
                  {/* Top Badge */}
                  <motion.div
                    className="bg-white/20 backdrop-blur-xl px-6 py-2.5 rounded-2xl border-2 border-white/30 mb-8"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-white/90 text-sm font-black tracking-wider uppercase">
                      Anonyme Nachricht
                    </p>
                  </motion.div>

                  {/* Message Card */}
                  <motion.div
                    className="bg-white rounded-3xl p-8 shadow-2xl w-full"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                  >
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto -mt-16 border-4 border-white shadow-xl flex items-center justify-center text-3xl"
                      animate={{
                        rotate: [0, -5, 5, -5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    >
                      🤫
                    </motion.div>

                    <p className="text-gray-900 text-xl sm:text-2xl font-black leading-snug text-center break-words mt-6">
                      "{selectedMessage.content}"
                    </p>
                  </motion.div>

                  {/* Bottom Info */}
                  <motion.div
                    className="mt-8 flex items-center gap-3 bg-white/20 backdrop-blur-xl px-6 py-3 rounded-2xl border-2 border-white/30"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Lock size={18} className="text-white" />
                    <p className="text-white text-sm font-black">
                      100% Anonym & Sicher
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Download Button */}
              <motion.button
                onClick={downloadStory}
                disabled={isDownloading}
                className="w-full mt-4 bg-white text-gray-900 font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {isDownloading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <RefreshCw size={20} />
                    </motion.div>
                    Story wird erstellt...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Als Bild herunterladen
                  </>
                )}
              </motion.button>

              {/* Delete Button */}
              <motion.button
                onClick={(e) => deleteMessage(selectedMessage.id, e)}
                className="w-full mt-2 bg-red-500/20 backdrop-blur-xl text-red-600 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 border-2 border-red-500/30 hover:bg-red-500/30 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Trash2 size={16} />
                Nachricht löschen
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
      }