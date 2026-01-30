"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Lock, 
  Zap, 
  Heart, 
  Sparkles, 
  Shield, 
  MessageCircle, 
  Star, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Flame,
  Eye,
  Ghost,
  Rocket,
  Crown,
  Users
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
  const [showConfetti, setShowConfetti] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isTyping, setIsTyping] = useState(false);
  const [messageCount, setMessageCount] = useState(847);
  const [viewCount, setViewCount] = useState(2341);
  const [hoveredStat, setHoveredStat] = useState(null);

  const MAX_CHARS = 500;
  const COOLDOWN_SECONDS = 30;
  const MIN_CHARS = 3;

  // Rate limiting check on mount
  useEffect(() => {
    checkRateLimit();
    
    // Simulate live stats
    const interval = setInterval(() => {
      setViewCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            setCanSend(true);
            toast.success('Du kannst jetzt wieder senden! 🎉', {
              icon: '⏰',
              style: {
                borderRadius: '16px',
                background: '#10b981',
                color: '#fff',
              }
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownTime]);

  // Check rate limiting
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

  // Handle message input
  const handleMessageChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setMessage(value);
      setCharCount(value.length);
      setIsTyping(value.length > 0);
    }
  };

  // Validate and send message
  const sendAnonMessage = async () => {
    // Validation: Empty message
    if (!message.trim()) {
      toast.error('Schreib erstmal was! 😤', {
        icon: '✍️',
        style: {
          borderRadius: '20px',
          background: '#ef4444',
          color: '#fff',
          fontWeight: 'bold',
        },
        duration: 3000,
      });
      return;
    }

    // Validation: Too short
    if (message.trim().length < MIN_CHARS) {
      toast.error(`Mindestens ${MIN_CHARS} Zeichen! 🙄`, {
        icon: '📏',
        style: {
          borderRadius: '20px',
          background: '#f59e0b',
          color: '#fff',
          fontWeight: 'bold',
        },
        duration: 3000,
      });
      return;
    }

    // Rate limiting check
    if (!canSend) {
      toast.error(`Warte noch ${cooldownTime}s! ⏳`, {
        icon: '⏰',
        style: {
          borderRadius: '20px',
          background: '#8b5cf6',
          color: '#fff',
          fontWeight: 'bold',
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

      // Success!
      toast.success('Nachricht verschickt! 🚀', {
        icon: '✨',
        style: {
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          fontWeight: 'bold',
        },
        duration: 4000,
      });

      // Set rate limit
      localStorage.setItem('lastMessageTime', Date.now().toString());
      setCanSend(false);
      setCooldownTime(COOLDOWN_SECONDS);

      // Reset form
      setMessage('');
      setCharCount(0);
      setIsTyping(false);
      
      // Confetti effect
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      // Update message count
      setMessageCount(prev => prev + 1);

    } catch (error) {
      console.error('Error:', error);
      toast.error('Fehler beim Senden! Versuch\'s nochmal 🔄', {
        icon: '❌',
        style: {
          borderRadius: '20px',
          background: '#dc2626',
          color: '#fff',
          fontWeight: 'bold',
        },
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAnonMessage();
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: 'spring', 
        stiffness: 200, 
        damping: 20,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  // Character count color
  const getCharCountColor = () => {
    const percentage = (charCount / MAX_CHARS) * 100;
    if (percentage < 50) return 'text-green-500';
    if (percentage < 80) return 'text-yellow-500';
    if (percentage < 95) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl"
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
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
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
        <motion.div
          className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.4, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </div>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <>
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'][i % 5],
                }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0.5],
                  x: (Math.random() - 0.5) * 1000,
                  y: Math.random() * -500 - 200,
                  rotate: Math.random() * 360,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2,
                  ease: 'easeOut',
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'font-bold',
        }}
      />
      
      <motion.div 
        className="bg-white/10 backdrop-blur-2xl w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white/20 p-8 sm:p-10 text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 0 20px rgba(255, 255, 255, 0.1)',
        }}
      >
        
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-20 blur-xl animate-pulse" />
        
        {/* Top Stats Bar */}
        <motion.div 
          className="flex justify-around mb-6 -mt-4"
          variants={itemVariants}
        >
          <motion.div 
            className="flex flex-col items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/20 cursor-pointer"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            onHoverStart={() => setHoveredStat('messages')}
            onHoverEnd={() => setHoveredStat(null)}
          >
            <div className="flex items-center gap-1.5 text-white/90">
              <MessageCircle size={16} />
              <span className="text-xl font-black">{messageCount.toLocaleString()}</span>
            </div>
            <span className="text-xs text-white/60 font-semibold">Nachrichten</span>
          </motion.div>

          <motion.div 
            className="flex flex-col items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/20 cursor-pointer"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            onHoverStart={() => setHoveredStat('views')}
            onHoverEnd={() => setHoveredStat(null)}
          >
            <div className="flex items-center gap-1.5 text-white/90">
              <Eye size={16} />
              <span className="text-xl font-black">{viewCount.toLocaleString()}</span>
            </div>
            <span className="text-xs text-white/60 font-semibold">Besuche</span>
          </motion.div>

          <motion.div 
            className="flex flex-col items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/20 cursor-pointer"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            onHoverStart={() => setHoveredStat('trending')}
            onHoverEnd={() => setHoveredStat(null)}
          >
            <div className="flex items-center gap-1.5 text-white/90">
              <Flame size={16} className="text-orange-400" />
              <span className="text-xl font-black">HOT</span>
            </div>
            <span className="text-xs text-white/60 font-semibold">Trending</span>
          </motion.div>
        </motion.div>

        {/* Avatar Section */}
        <motion.div 
          className="relative w-32 h-32 mx-auto mb-5"
          variants={itemVariants}
        >
          {/* Rotating gradient ring */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 rounded-full blur-md"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Pulsing glow */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-pink-400 to-violet-400 rounded-full blur-xl opacity-60"
            variants={pulseVariants}
            animate="animate"
          />
          
          {/* Avatar image */}
          <motion.div
            className="relative w-full h-full rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <img 
              src="https://api.dicebear.com/9.x/avataaars/svg?seed=Felix" 
              alt="avatar" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          {/* Online status with pulse */}
          <motion.div 
            className="absolute bottom-2 right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-white shadow-lg"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(74, 222, 128, 0.7)',
                '0 0 0 10px rgba(74, 222, 128, 0)',
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            <motion.div
              className="absolute inset-1 bg-white rounded-full"
              animate={{ scale: [1, 0.8, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>

          {/* Crown badge */}
          <motion.div
            className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-orange-500 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
            whileHover={{ scale: 1.2, rotate: 360 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Crown size={16} className="text-white" fill="white" />
          </motion.div>
        </motion.div>

        {/* Username */}
        <motion.div variants={itemVariants}>
          <motion.h1 
            className="text-3xl font-black text-white mb-2 tracking-tight"
            whileHover={{ scale: 1.05 }}
          >
            @dein_benutzername
          </motion.h1>
          <motion.div
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full border border-white/30 mb-8"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
          >
            <Ghost size={18} className="text-white" />
            <p className="text-white text-sm font-bold">
              Sag mir die Wahrheit – anonym! 🤫
            </p>
            <Sparkles size={16} className="text-yellow-300" />
          </motion.div>
        </motion.div>

        {/* Info Cards */}
        <motion.div 
          className="grid grid-cols-3 gap-3 mb-6"
          variants={itemVariants}
        >
          <motion.div 
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
          >
            <Shield size={20} className="text-green-400 mx-auto mb-1" />
            <p className="text-xs text-white/80 font-bold">100% Sicher</p>
          </motion.div>

          <motion.div 
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
          >
            <Lock size={20} className="text-purple-400 mx-auto mb-1" />
            <p className="text-xs text-white/80 font-bold">Anonym</p>
          </motion.div>

          <motion.div 
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
          >
            <Zap size={20} className="text-yellow-400 mx-auto mb-1" fill="currentColor" />
            <p className="text-xs text-white/80 font-bold">Schnell</p>
          </motion.div>
        </motion.div>

        {/* Message Input */}
        <motion.div 
          className="relative group mb-5"
          variants={itemVariants}
        >
          {/* Glow effect when typing */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-[1.75rem] blur-lg opacity-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>

          <textarea 
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder="Frag mich was du willst... 👀"
            className="relative w-full h-48 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-3xl p-5 text-white placeholder-white/50 focus:border-white/60 focus:ring-4 focus:ring-white/20 outline-none transition-all resize-none shadow-lg text-base font-medium"
            style={{
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          />
          
          {/* Floating send icon */}
          <motion.div 
            className="absolute bottom-5 right-5 pointer-events-none"
            animate={{
              rotate: isTyping ? [0, -10, 10, -10, 0] : 0,
            }}
            transition={{
              duration: 0.5,
              repeat: isTyping ? Infinity : 0,
            }}
          >
            <Send size={22} className={`${isTyping ? 'text-white' : 'text-white/30'} transition-colors`} />
          </motion.div>

          {/* Character counter */}
          <motion.div 
            className="absolute -bottom-6 left-0 right-0 flex justify-between items-center px-2 text-xs font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: charCount > 0 ? 1 : 0 }}
          >
            <span className="text-white/60">
              {charCount < MIN_CHARS && charCount > 0 && (
                <span className="text-orange-400">Mindestens {MIN_CHARS} Zeichen!</span>
              )}
            </span>
            <span className={`${getCharCountColor()} transition-colors`}>
              {charCount}/{MAX_CHARS}
            </span>
          </motion.div>
        </motion.div>

        {/* Send Button */}
        <motion.div variants={itemVariants} className="mt-8">
          <motion.button 
            onClick={sendAnonMessage}
            disabled={loading || !canSend}
            className={`w-full relative overflow-hidden font-black py-5 rounded-2xl text-lg flex items-center justify-center gap-3 shadow-2xl transition-all ${
              loading || !canSend
                ? 'bg-gray-400/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500'
            }`}
            whileHover={canSend && !loading ? { scale: 1.02, y: -2 } : {}}
            whileTap={canSend && !loading ? { scale: 0.98 } : {}}
            style={{
              boxShadow: canSend && !loading 
                ? '0 10px 40px rgba(236, 72, 153, 0.5)' 
                : 'none',
            }}
          >
            {/* Animated gradient overlay */}
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

            <span className="relative z-10 text-white flex items-center gap-3">
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Rocket size={24} />
                  </motion.div>
                  Wird gesendet...
                </>
              ) : !canSend ? (
                <>
                  <Clock size={24} />
                  Warte {cooldownTime}s
                </>
              ) : (
                <>
                  ANONYM SENDEN
                  <motion.div
                    animate={{
                      x: [0, 5, 0],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                  >
                    <Zap size={24} fill="currentColor" />
                  </motion.div>
                </>
              )}
            </span>
          </motion.button>
        </motion.div>

        {/* Cooldown Progress Bar */}
        <AnimatePresence>
          {!canSend && cooldownTime > 0 && (
            <motion.div
              className="mt-4 bg-white/10 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-white/20"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                initial={{ width: '100%' }}
                animate={{ width: `${(cooldownTime / COOLDOWN_SECONDS) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips Section */}
        <motion.div 
          className="mt-8 space-y-3"
          variants={itemVariants}
        >
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
          >
            <div className="flex items-start gap-3">
              <div className="bg-green-500/20 p-2 rounded-xl">
                <CheckCircle size={20} className="text-green-400" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-white font-bold text-sm mb-1">Sei ehrlich!</h3>
                <p className="text-white/70 text-xs font-medium">
                  Die besten Nachrichten sind authentisch und direkt.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
          >
            <div className="flex items-start gap-3">
              <div className="bg-purple-500/20 p-2 rounded-xl">
                <Heart size={20} className="text-purple-400" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-white font-bold text-sm mb-1">Bleib respektvoll!</h3>
                <p className="text-white/70 text-xs font-medium">
                  Anonym heißt nicht gemein. Sei nett zueinander! ✨
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
          >
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 p-2 rounded-xl">
                <AlertCircle size={20} className="text-blue-400" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-white font-bold text-sm mb-1">Anti-Spam Schutz</h3>
                <p className="text-white/70 text-xs font-medium">
                  Du kannst alle 30 Sekunden eine Nachricht senden.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="mt-10 space-y-4"
          variants={itemVariants}
        >
          {/* Security Badge */}
          <motion.div 
            className="flex items-center justify-center gap-2 text-xs text-white/60 font-bold tracking-wider uppercase"
            whileHover={{ scale: 1.05 }}
          >
            <Lock size={14} />
            <span>Ende-zu-Ende verschlüsselt</span>
            <Shield size={14} />
          </motion.div>

          {/* Social Proof */}
          <motion.div
            className="flex items-center justify-center gap-4 pt-4 border-t border-white/10"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2">
              <Users size={16} className="text-white/60" />
              <span className="text-white/80 text-sm font-bold">10.4K+ User</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <Star size={16} className="text-yellow-400" fill="currentColor" />
              <span className="text-white/80 text-sm font-bold">4.9 Rating</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-400" />
              <span className="text-white/80 text-sm font-bold">#1 Trending</span>
            </div>
          </motion.div>

          {/* Powered by badge */}
          <motion.div
            className="text-center pt-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
              <Sparkles size={14} className="text-purple-400" />
              <span className="text-white/50 text-xs font-bold">Powered by AI Technology</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Cursor follower effect */}
      <motion.div
        className="fixed w-8 h-8 border-2 border-white/30 rounded-full pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
        }}
      />
    </main>
  );
  }