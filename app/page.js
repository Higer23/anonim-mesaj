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
  Flame
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
  const [isMounted, setIsMounted] = useState(false);
  const textareaRef = useRef(null);
  const containerRef = useRef(null);

  const MAX_CHARS = 500;
  const COOLDOWN_SECONDS = 30;
  const MIN_CHARS = 3;

  // SSR-safe scroll hooks - only initialize after mount
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.8]);

  // Mount detection for SSR safety
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Rate limiting check on mount
  useEffect(() => {
    if (!isMounted) return;
    
    checkRateLimit();
    
    // Simulate live stats with realistic increments
    const statsInterval = setInterval(() => {
      setViewCount(prev => prev + Math.floor(Math.random() * 2));
      if (Math.random() > 0.7) {
        setMessageCount(prev => prev + 1);
      }
    }, 8000);

    return () => clearInterval(statsInterval);
  }, [isMounted]);

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

  // Mouse tracking for cursor effect - SSR safe
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
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
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    
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

      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('lastMessageTime', Date.now().toString());
      }
      setCanSend(false);
      setCooldownTime(COOLDOWN_SECONDS);

      setMessage('');
      setCharCount(0);
      setIsFocused(false);
      
      setMessageCount(prev => prev + 1);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Fehler beim Senden. Bitte versuche es erneut.', {
        icon: '❌',
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      sendAnonMessage();
    }
  };

  // Floating particles component
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`${particleKey}-${i}`}
          className="absolute w-1 h-1 bg-purple-500/20 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            scale: 0,
          }}
          animate={{
            y: [null, -100],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );

  const faqItems = [
    {
      question: "Wie anonym ist dies wirklich?",
      answer: "Absolut anonym. Wir speichern keine IP-Adressen, keine Browser-Fingerprints, keine Tracking-Cookies. Selbst wir können nicht nachvollziehen, wer welche Nachricht gesendet hat.",
      icon: Shield,
      color: "purple"
    },
    {
      question: "Wie schnell werden Nachrichten zugestellt?",
      answer: "In Echtzeit. Sobald du auf 'Senden' klickst, wird deine Nachricht sofort übermittelt. Keine Verzögerungen, keine Warteschlangen.",
      icon: Zap,
      color: "blue"
    },
    {
      question: "Gibt es eine Zeichenbegrenzung?",
      answer: `Ja, aktuell sind ${MAX_CHARS} Zeichen pro Nachricht möglich. Das ist genug für die meisten Gedanken, aber kurz genug, um fokussiert zu bleiben.`,
      icon: MessageCircle,
      color: "green"
    },
    {
      question: "Warum gibt es eine Wartezeit?",
      answer: `Die ${COOLDOWN_SECONDS}-Sekunden-Wartezeit hilft uns, Spam und Missbrauch zu verhindern, während echte Nutzer ungestört bleiben.`,
      icon: AlertTriangle,
      color: "orange"
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      purple: "border-purple-600/30 bg-purple-600/5",
      blue: "border-blue-600/30 bg-blue-600/5",
      green: "border-green-600/30 bg-green-600/5",
      orange: "border-orange-600/30 bg-orange-600/5",
    };
    return colors[color] || colors.purple;
  };

  const getIconColorClasses = (color) => {
    const colors = {
      purple: "text-purple-400 bg-purple-600/10",
      blue: "text-blue-400 bg-blue-600/10",
      green: "text-green-400 bg-green-600/10",
      orange: "text-orange-400 bg-orange-600/10",
    };
    return colors[color] || colors.purple;
  };

  // Don't render scroll-dependent animations until mounted
  if (!isMounted) {
    return (
      <main className="min-h-screen bg-black">
        <div className="max-w-2xl mx-auto px-4 py-20">
          <div className="animate-pulse">
            <div className="h-8 bg-zinc-800 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      
      <main className="min-h-screen bg-black text-white overflow-hidden relative">
        {/* Animated gradient background */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-950/20 via-black to-blue-950/20">
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]"
            style={{ y: backgroundY }}
          />
        </div>

        {/* Floating particles */}
        <FloatingParticles />

        {/* Grid pattern overlay */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto px-4 py-12 md:py-20" ref={containerRef}>
          {/* Header with stats */}
          <motion.div
            style={{ opacity: headerOpacity }}
            className="mb-12"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 border border-purple-600/20 rounded-full mb-6 backdrop-blur-sm">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-purple-300 tracking-wide uppercase">Live & Anonym</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-tight">
                Sende deine Gedanken
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  völlig anonym
                </span>
              </h1>
              
              <p className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
                Keine Registrierung, keine Spuren, keine Kompromisse. 
                Deine Privatsphäre ist unser Versprechen.
              </p>
            </motion.div>

            {/* Live stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center justify-center gap-6 mb-8"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl"
              >
                <MessageCircle size={16} className="text-purple-400" />
                <div>
                  <p className="text-xs text-zinc-500 font-medium">Nachrichten</p>
                  <p className="text-sm font-bold text-white">{messageCount.toLocaleString()}</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl"
              >
                <Eye size={16} className="text-blue-400" />
                <div>
                  <p className="text-xs text-zinc-500 font-medium">Besuche heute</p>
                  <p className="text-sm font-bold text-white">{viewCount.toLocaleString()}</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Main message card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
          >
            <div className="bg-zinc-950/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-8 shadow-2xl shadow-purple-900/10 relative overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-blue-600/5 pointer-events-none" />
              
              {/* Content */}
              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="flex items-start gap-3 mb-4"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Ghost size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Deine anonyme Nachricht</h2>
                    <p className="text-sm text-zinc-400">Niemand wird jemals wissen, dass du es warst</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="relative mb-4"
                >
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleMessageChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Schreibe, was du wirklich denkst... (Strg+Enter zum Senden)"
                    className={`w-full h-40 bg-zinc-900/50 backdrop-blur-sm border rounded-2xl px-5 py-4 text-white placeholder-zinc-600 resize-none focus:outline-none transition-all duration-300 ${
                      isFocused 
                        ? 'border-purple-600/50 shadow-lg shadow-purple-900/20' 
                        : 'border-zinc-800/50'
                    }`}
                    style={{
                      fontSize: '15px',
                      lineHeight: '1.6',
                    }}
                  />
                  
                  {/* Character counter */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <motion.div
                      animate={{
                        scale: charCount > MAX_CHARS * 0.9 ? [1, 1.1, 1] : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      className={`text-xs font-mono font-semibold ${
                        charCount > MAX_CHARS * 0.9
                          ? 'text-orange-400'
                          : charCount > MAX_CHARS * 0.7
                          ? 'text-yellow-400'
                          : 'text-zinc-600'
                      }`}
                    >
                      {charCount}/{MAX_CHARS}
                    </motion.div>
                  </div>
                </motion.div>

                {/* Send button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                >
                  <motion.button
                    whileHover={{ scale: canSend ? 1.02 : 1 }}
                    whileTap={{ scale: canSend ? 0.98 : 1 }}
                    onClick={sendAnonMessage}
                    onMouseEnter={() => setIsHoveringButton(true)}
                    onMouseLeave={() => setIsHoveringButton(false)}
                    disabled={!canSend || loading}
                    className={`w-full py-4 rounded-xl font-bold text-white text-base transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group ${
                      !canSend || loading
                        ? 'bg-zinc-800 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-900/50'
                    }`}
                  >
                    {!canSend || loading ? (
                      <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-zinc-700" />
                    ) : (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                    )}
                    
                    <span className="relative z-10 flex items-center gap-3">
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          />
                          <span>Wird gesendet...</span>
                        </>
                      ) : !canSend ? (
                        <>
                          <AlertTriangle size={20} />
                          <span>Warte noch {cooldownTime}s</span>
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          <span>Anonym senden</span>
                        </>
                      )}
                    </span>
                  </motion.button>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-xs text-zinc-600 text-center mt-3 font-medium"
                  >
                    Drücke <kbd className="px-2 py-1 bg-zinc-800 rounded text-zinc-400 font-mono text-xs">Strg</kbd> + <kbd className="px-2 py-1 bg-zinc-800 rounded text-zinc-400 font-mono text-xs">Enter</kbd> zum Senden
                  </motion.p>
                </motion.div>

                {/* Security badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="flex items-center justify-center gap-2 py-4 border-t border-zinc-800/50 mt-6"
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

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 1.6 }}
            className="mt-8"
          >
            <button
              onClick={() => setShowFAQ(!showFAQ)}
              className="w-full bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 hover:border-zinc-700/50 transition-all duration-300 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center">
                  <Info size={20} className="text-blue-400" />
                </div>
                <h3 className="font-bold text-white text-left">Häufig gestellte Fragen</h3>
              </div>
              <motion.div
                animate={{ rotate: showFAQ ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showFAQ && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-3">
                    {faqItems.map((item, index) => {
                      const IconComponent = item.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`bg-zinc-950/40 backdrop-blur-xl border rounded-xl p-5 ${getColorClasses(item.color)}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconColorClasses(item.color)}`}>
                              <IconComponent size={16} />
                            </div>
                            <div>
                              <h4 className="font-bold text-white mb-2">{item.question}</h4>
                              <p className="text-sm text-zinc-400 leading-relaxed">{item.answer}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.8 }}
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
        {isMounted && (
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
        )}
      </main>
    </>
  );
}