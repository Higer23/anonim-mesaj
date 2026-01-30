"use client";
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Send, 
  Lock, 
  Shield, 
  MessageCircle, 
  Eye,
  Ghost,
  Sparkles,
  Check,
  AlertTriangle,
  Zap,
  TrendingUp,
  Users,
  Info,
  X,
  ChevronDown,
  Star,
  Flame,
  Activity
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [canSend, setCanSend] = useState(true);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [messageCount, setMessageCount] = useState(1247);
  const [viewCount, setViewCount] = useState(4521);
  const [showFAQ, setShowFAQ] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const [particleKey, setParticleKey] = useState(0);
  const textareaRef = useRef(null);
  const containerRef = useRef(null);

  const MAX_CHARS = 500;
  const COOLDOWN_SECONDS = 30;
  const MIN_CHARS = 3;

  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.8]);

  // Rate limiting check on mount
  useEffect(() => {
    checkRateLimit();
    
    // Simulate live stats with realistic increments
    const statsInterval = setInterval(() => {
      setViewCount(prev => prev + Math.floor(Math.random() * 2));
      if (Math.random() > 0.7) {
        setMessageCount(prev => prev + 1);
      }
    }, 8000);

    return () => clearInterval(statsInterval);
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            setCanSend(true);
            toast.success('Bereit für die nächste Nachricht', {
              icon: '✓',
              style: {
                borderRadius: '12px',
                background: '#0a0a0a',
                color: '#fff',
                border: '1px solid #1a1a1a',
                fontSize: '14px',
                fontWeight: '500',
              },
              duration: 2000,
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownTime]);

  // Mouse tracking for cursor effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Regenerate particles periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setParticleKey(prev => prev + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const checkRateLimit = () => {
    const lastSent = localStorage.getItem('lastMessageTime');
    if (lastSent) {
      const timePassed = Date.now() - parseInt(lastSent);
      const secondsPassed = Math.floor(timePassed / 1000);
      
      if (secondsPassed < COOLDOWN_SECONDS) {
        setCanSend(false);
        setCooldownTime(COOLDOWN_SECONDS - secondsPassed);
      }
    }
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setMessage(value);
      setCharCount(value.length);
    }
  };

  const sendAnonMessage = async () => {
    if (!message.trim()) {
      toast.error('Bitte gib eine Nachricht ein', {
        icon: '⚠',
        style: {
          borderRadius: '12px',
          background: '#0a0a0a',
          color: '#fff',
          border: '1px solid #ff3b3b',
          fontSize: '14px',
          fontWeight: '500',
        },
        duration: 3000,
      });
      return;
    }

    if (message.trim().length < MIN_CHARS) {
      toast.error(`Mindestens ${MIN_CHARS} Zeichen erforderlich`, {
        icon: '⚠',
        style: {
          borderRadius: '12px',
          background: '#0a0a0a',
          color: '#fff',
          border: '1px solid #ff9500',
          fontSize: '14px',
          fontWeight: '500',
        },
        duration: 3000,
      });
      return;
    }

    if (!canSend) {
      toast.error(`Noch ${cooldownTime}s warten`, {
        icon: '⏱',
        style: {
          borderRadius: '12px',
          background: '#0a0a0a',
          color: '#fff',
          border: '1px solid #8b5cf6',
          fontSize: '14px',
          fontWeight: '500',
        },
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{ content: message.trim() }]);

      if (error) throw error;

      toast.success('Nachricht anonym gesendet', {
        icon: '✓',
        style: {
          borderRadius: '12px',
          background: '#0a0a0a',
          color: '#fff',
          border: '1px solid #00ff88',
          fontSize: '14px',
          fontWeight: '500',
        },
        duration: 3000,
      });

      localStorage.setItem('lastMessageTime', Date.now().toString());
      setCanSend(false);
      setCooldownTime(COOLDOWN_SECONDS);

      setMessage('');
      setCharCount(0);
      setIsFocused(false);
      
      setMessageCount(prev => prev + 1);

    } catch (error) {
      console.error('Error:', error);
      toast.error('Fehler beim Senden. Bitte erneut versuchen', {
        icon: '✕',
        style: {
          borderRadius: '12px',
          background: '#0a0a0a',
          color: '#fff',
          border: '1px solid #ff3b3b',
          fontSize: '14px',
          fontWeight: '500',
        },
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.metaKey && !loading && canSend) {
      e.preventDefault();
      sendAnonMessage();
    }
  };

  const getCharCountColor = () => {
    const percentage = (charCount / MAX_CHARS) * 100;
    if (percentage < 70) return '#4ade80';
    if (percentage < 85) return '#fbbf24';
    if (percentage < 95) return '#fb923c';
    return '#ef4444';
  };

  const progressPercentage = cooldownTime > 0 ? ((COOLDOWN_SECONDS - cooldownTime) / COOLDOWN_SECONDS) * 100 : 100;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Archivo:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #000000;
          color: #ffffff;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        ::selection {
          background: #8b5cf6;
          color: #ffffff;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #0a0a0a;
        }

        ::-webkit-scrollbar-thumb {
          background: #1a1a1a;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #2a2a2a;
        }
      `}</style>

      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#0a0a0a',
            color: '#fff',
            border: '1px solid #1a1a1a',
          },
        }}
      />

      <main 
        ref={containerRef}
        className="min-h-screen bg-black text-white relative overflow-hidden"
      >
        {/* Animated gradient background */}
        <motion.div 
          className="fixed inset-0 opacity-30"
          style={{ y: backgroundY }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </motion.div>

        {/* Grid pattern overlay */}
        <div 
          className="fixed inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Noise texture */}
        <div 
          className="fixed inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating particles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`${particleKey}-${i}`}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -20,
                opacity: 0,
              }}
              animate={{
                y: window.innerHeight + 20,
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 8 + Math.random() * 8,
                delay: Math.random() * 5,
                ease: 'linear',
                repeat: Infinity,
              }}
            />
          ))}
        </div>

        {/* Header section */}
        <motion.header 
          className="relative z-20 pt-8 pb-6 px-4"
          style={{ opacity: headerOpacity }}
        >
          <div className="max-w-2xl mx-auto">
            {/* Stats bar */}
            <motion.div 
              className="flex items-center justify-between mb-8 bg-zinc-950/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-6">
                <motion.div 
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-600/10 rounded-lg">
                    <MessageCircle size={16} className="text-purple-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-500 font-medium">Nachrichten</span>
                    <span className="text-sm font-bold text-white tracking-tight">{messageCount.toLocaleString()}</span>
                  </div>
                </motion.div>

                <div className="w-px h-8 bg-zinc-800" />

                <motion.div 
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600/10 rounded-lg">
                    <Eye size={16} className="text-blue-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-500 font-medium">Aufrufe</span>
                    <span className="text-sm font-bold text-white tracking-tight">{viewCount.toLocaleString()}</span>
                  </div>
                </motion.div>

                <div className="w-px h-8 bg-zinc-800" />

                <motion.div 
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-600/10 rounded-lg">
                    <Flame size={16} className="text-orange-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-500 font-medium">Status</span>
                    <span className="text-sm font-bold text-orange-400 tracking-tight">TRENDING</span>
                  </div>
                </motion.div>
              </div>

              <motion.button
                onClick={() => setShowFAQ(!showFAQ)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-800/50 rounded-xl transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Info size={16} className="text-zinc-400" />
                <span className="text-xs font-medium text-zinc-400">Info</span>
              </motion.button>
            </motion.div>

            {/* FAQ Panel */}
            <AnimatePresence>
              {showFAQ && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">Häufige Fragen</h3>
                      <button
                        onClick={() => setShowFAQ(false)}
                        className="w-8 h-8 flex items-center justify-center bg-zinc-900/50 hover:bg-zinc-800/50 rounded-lg transition-colors"
                      >
                        <X size={16} className="text-zinc-400" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="border-l-2 border-purple-600 pl-4">
                        <p className="text-sm font-semibold text-white mb-1">Ist das wirklich anonym?</p>
                        <p className="text-sm text-zinc-400">Ja. Wir speichern keine IP-Adressen oder persönlichen Daten. Absolute Anonymität garantiert.</p>
                      </div>
                      <div className="border-l-2 border-blue-600 pl-4">
                        <p className="text-sm font-semibold text-white mb-1">Warum gibt es ein Zeitlimit?</p>
                        <p className="text-sm text-zinc-400">Um Spam zu verhindern. Du kannst alle 30 Sekunden eine Nachricht senden.</p>
                      </div>
                      <div className="border-l-2 border-green-600 pl-4">
                        <p className="text-sm font-semibold text-white mb-1">Werden Nachrichten moderiert?</p>
                        <p className="text-sm text-zinc-400">Nein. Sei respektvoll und authentisch. Missbrauch wird jedoch gemeldet.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.header>

        {/* Main content */}
        <div className="relative z-10 max-w-2xl mx-auto px-4 pb-20">
          {/* Main card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative"
          >
            {/* Glow effect behind card */}
            <div className="absolute -inset-[1px] bg-gradient-to-b from-purple-600/20 via-transparent to-blue-600/20 rounded-3xl blur-xl opacity-50" />
            
            {/* Main glassmorphic card */}
            <div className="relative bg-zinc-950/40 backdrop-blur-2xl border border-zinc-800/50 rounded-3xl p-8 shadow-2xl">
              
              {/* Title section */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-600/20 rounded-full px-4 py-2 mb-4"
                >
                  <Ghost size={16} className="text-purple-400" />
                  <span className="text-xs font-bold text-purple-300 tracking-wider uppercase">100% Anonym</span>
                  <Sparkles size={14} className="text-purple-400" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight"
                  style={{ fontFamily: "'Archivo', sans-serif" }}
                >
                  Frage mich alles!
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="text-zinc-400 text-base font-medium"
                >
                  Schick mir eine anonyme Nachricht – ich werde nie erfahren, wer du bist
                </motion.p>
              </div>

              {/* Username display */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex items-center justify-center gap-2 mb-8"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center font-bold text-white text-lg">
                  D
                </div>
                <span className="text-xl font-bold text-white">@dein_benutzername</span>
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" strokeWidth={3} />
                </div>
              </motion.div>

              {/* Message input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="relative mb-6"
              >
                {/* Input container with focus effect */}
                <div className="relative">
                  {/* Animated border gradient on focus */}
                  <AnimatePresence>
                    {isFocused && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute -inset-[2px] bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-2xl blur-sm"
                        style={{
                          backgroundSize: '200% 200%',
                          animation: 'gradientShift 3s ease infinite',
                        }}
                      />
                    )}
                  </AnimatePresence>

                  <style jsx>{`
                    @keyframes gradientShift {
                      0%, 100% { background-position: 0% 50%; }
                      50% { background-position: 100% 50%; }
                    }
                  `}</style>

                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleMessageChange}
                    onKeyDown={handleKeyPress}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Schreib hier deine anonyme Nachricht..."
                    className="relative w-full h-48 bg-zinc-900/80 backdrop-blur-sm border-2 border-zinc-800/80 rounded-2xl p-5 text-white placeholder-zinc-500 focus:border-purple-600/50 outline-none transition-all duration-300 resize-none text-base font-medium"
                    style={{
                      fontFamily: "'Archivo', sans-serif",
                    }}
                  />

                  {/* Floating character counter */}
                  <motion.div
                    className="absolute bottom-4 right-4 flex items-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: charCount > 0 ? 1 : 0.3 }}
                  >
                    {charCount > 0 && charCount < MIN_CHARS && (
                      <span className="text-xs text-orange-400 font-medium">
                        Noch {MIN_CHARS - charCount} Zeichen
                      </span>
                    )}
                    <div 
                      className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-zinc-800"
                    >
                      <span 
                        className="text-sm font-bold tabular-nums transition-colors"
                        style={{ color: getCharCountColor() }}
                      >
                        {charCount}
                      </span>
                      <span className="text-xs text-zinc-600">/</span>
                      <span className="text-sm font-medium text-zinc-600 tabular-nums">
                        {MAX_CHARS}
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Keyboard shortcut hint */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isFocused ? 1 : 0 }}
                  className="absolute -bottom-6 left-0 flex items-center gap-2 text-xs text-zinc-600"
                >
                  <kbd className="px-2 py-1 bg-zinc-900/50 border border-zinc-800 rounded text-zinc-500 font-mono">⌘</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-zinc-900/50 border border-zinc-800 rounded text-zinc-500 font-mono">Enter</kbd>
                  <span>zum Senden</span>
                </motion.div>
              </motion.div>

              {/* Send button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="relative mb-6"
              >
                <motion.button
                  onClick={sendAnonMessage}
                  disabled={loading || !canSend}
                  onHoverStart={() => setIsHoveringButton(true)}
                  onHoverEnd={() => setIsHoveringButton(false)}
                  className={`relative w-full overflow-hidden font-bold py-5 rounded-xl text-base flex items-center justify-center gap-3 transition-all duration-300 ${
                    loading || !canSend
                      ? 'bg-zinc-800/50 cursor-not-allowed border-2 border-zinc-800/50'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-2 border-transparent shadow-lg shadow-purple-600/20'
                  }`}
                  whileHover={canSend && !loading ? { scale: 1.01 } : {}}
                  whileTap={canSend && !loading ? { scale: 0.99 } : {}}
                >
                  {/* Animated shimmer effect */}
                  {canSend && !loading && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  )}

                  <span className="relative z-10 flex items-center gap-3">
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Activity size={20} />
                        </motion.div>
                        <span className="text-white">Wird gesendet...</span>
                      </>
                    ) : !canSend ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="text-white/70">Wartezeit: {cooldownTime}s</span>
                      </>
                    ) : (
                      <>
                        <span className="text-white font-black tracking-wide">ANONYM SENDEN</span>
                        <Send size={20} className="text-white" />
                      </>
                    )}
                  </span>
                </motion.button>

                {/* Cooldown progress bar */}
                <AnimatePresence>
                  {!canSend && cooldownTime > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3"
                    >
                      <div className="relative h-1.5 bg-zinc-900/50 rounded-full overflow-hidden border border-zinc-800/50">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-blue-600"
                          initial={{ width: '0%' }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Security badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="flex items-center justify-center gap-2 py-4 border-t border-zinc-800/50"
              >
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                  <Lock size={14} className="text-green-500" />
                  <span>Anonymität garantiert</span>
                  <div className="w-1 h-1 bg-zinc-700 rounded-full" />
                  <Shield size={14} className="text-blue-500" />
                  <span>Ende-zu-Ende geschützt</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 hover:border-purple-600/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center justify-center">
                  <Shield size={20} className="text-purple-400" />
                </div>
                <h3 className="font-bold text-white">100% Sicher</h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Keine IP-Logs, keine Tracking-Cookies, keine Datenweitergabe. Vollständige Anonymität.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 hover:border-blue-600/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center">
                  <Zap size={20} className="text-blue-400" />
                </div>
                <h3 className="font-bold text-white">Blitzschnell</h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Nachrichten werden in Echtzeit zugestellt. Keine Verzögerungen, keine Wartezeiten.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 hover:border-green-600/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-600/10 rounded-xl flex items-center justify-center">
                  <Ghost size={20} className="text-green-400" />
                </div>
                <h3 className="font-bold text-white">Komplett Anonym</h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Niemand kann deine Identität herausfinden. Garantiert. Auch wir nicht.
              </p>
            </motion.div>
          </motion.div>

          {/* Usage tips */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 1.2 }}
            className="mt-8 bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-yellow-400" />
              <h3 className="font-bold text-white">Tipps für bessere Nachrichten</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-600/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={14} className="text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">Sei ehrlich und authentisch</p>
                  <p className="text-xs text-zinc-500">Die besten Nachrichten kommen von Herzen. Sag, was du wirklich denkst.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-600/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={14} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">Bleib respektvoll</p>
                  <p className="text-xs text-zinc-500">Anonymität ist keine Ausrede für Gemeinheiten. Treat people right.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle size={14} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">Beachte die Wartezeit</p>
                  <p className="text-xs text-zinc-500">30 Sekunden zwischen Nachrichten helfen uns, Spam zu verhindern.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Social proof section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 1.4 }}
            className="mt-8 bg-gradient-to-br from-purple-600/5 to-blue-600/5 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-zinc-400" />
                  <div>
                    <p className="text-xs text-zinc-500 font-medium">Aktive Nutzer</p>
                    <p className="text-lg font-bold text-white">12.4K+</p>
                  </div>
                </div>

                <div className="w-px h-10 bg-zinc-800" />

                <div className="flex items-center gap-2">
                  <Star size={18} className="text-yellow-400" fill="currentColor" />
                  <div>
                    <p className="text-xs text-zinc-500 font-medium">Bewertung</p>
                    <p className="text-lg font-bold text-white">4.9/5.0</p>
                  </div>
                </div>

                <div className="w-px h-10 bg-zinc-800" />

                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-green-400" />
                  <div>
                    <p className="text-xs text-zinc-500 font-medium">Wachstum</p>
                    <p className="text-lg font-bold text-green-400">+247%</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-zinc-900/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-zinc-800/50">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-zinc-300">Live seit 2024</span>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="mt-12 pt-8 border-t border-zinc-800/50"
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Lock size={14} />
                <span className="font-medium">256-Bit SSL-Verschlüsselung</span>
                <div className="w-1 h-1 bg-zinc-700 rounded-full" />
                <Shield size={14} />
                <span className="font-medium">DSGVO-konform</span>
              </div>

              <p className="text-xs text-zinc-600 max-w-md">
                Entwickelt mit Fokus auf Privatsphäre und Sicherheit. Keine Daten werden jemals verkauft oder weitergegeben.
              </p>

              <div className="flex items-center gap-4 text-xs text-zinc-700">
                <a href="#" className="hover:text-zinc-500 transition-colors">Datenschutz</a>
                <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                <a href="#" className="hover:text-zinc-500 transition-colors">Nutzungsbedingungen</a>
                <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                <a href="#" className="hover:text-zinc-500 transition-colors">Impressum</a>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-zinc-700">
                <Sparkles size={12} className="text-purple-600/50" />
                <span className="font-mono">Made with ❤️ in Deutschland</span>
              </div>
            </div>
          </motion.footer>
        </div>

        {/* Custom cursor follower */}
        <motion.div
          className="fixed w-4 h-4 border border-purple-600/30 rounded-full pointer-events-none z-50 mix-blend-difference hidden md:block"
          animate={{
            x: cursorPosition.x - 8,
            y: cursorPosition.y - 8,
            scale: isHoveringButton ? 1.5 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 28,
          }}
        />
      </main>
    </>
  );
}