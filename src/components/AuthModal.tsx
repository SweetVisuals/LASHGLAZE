/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { supabase } from '../supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, storeSettings } = useApp();
  const theme = storeSettings.colors;
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: 'Lash Glaze Member' },
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        
        if (data.session) {
           alert('Account created and logged in!');
        } else {
           alert('Verification email sent! Please check your inbox to activate your account.');
        }
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-paper overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col"
        style={{ backgroundColor: theme.paper }}
      >
        {/* Top Branding Section */}
        <div className="relative h-32 bg-ink flex flex-col items-center justify-center p-8 overflow-hidden" style={{ backgroundColor: theme.ink }}>
          <div className="absolute inset-0 opacity-20 pointer-events-none">
             <div className="absolute top-0 right-0 w-64 h-64 bg-gold/30 blur-[80px]" style={{ backgroundColor: theme.gold }} />
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 blur-[60px]" style={{ backgroundColor: theme.accent }} />
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-paper/50 hover:text-paper transition-colors z-20"
          >
            <X size={20} />
          </button>
          
          <div className="text-center z-10">
            <span className="font-serif text-2xl italic font-bold uppercase tracking-widest text-paper" style={{ color: theme.paper }}>Lash Glaze</span>
            <span className="block text-[9px] tracking-[0.4em] font-bold mt-1 opacity-50 uppercase leading-none text-paper" style={{ color: theme.paper }}>Strip Lashes</span>
          </div>
        </div>

        <div className="p-10 space-y-8">
          <div className="text-center">
            <h2 className="text-xl font-serif italic mb-2" style={{ color: theme.ink }}>
              {isLogin ? 'Welcome Back' : 'Join the Atelier'}
            </h2>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40" style={{ color: theme.muted }}>
              {isLogin ? 'Enter your credentials to proceed' : 'Create an account for premium access'}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-1">
              <div className="relative group">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 group-focus-within:opacity-100 transition-opacity" style={{ color: theme.gold }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL ADDRESS"
                  required
                  className="w-full bg-accent/10 p-4 pl-12 text-[10px] font-bold tracking-widest outline-none transition-all placeholder:opacity-30 shadow-inner"
                  style={{ color: theme.ink }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative group">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 group-focus-within:opacity-100 transition-opacity" style={{ color: theme.gold }} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="PASSWORD"
                  required
                  className="w-full bg-accent/10 p-4 pl-12 text-[10px] font-bold tracking-widest outline-none transition-all placeholder:opacity-30 shadow-inner rounded-none"
                  style={{ color: theme.ink }}
                />
              </div>
            </div>

            {error && <p className="text-[9px] text-red-500 uppercase tracking-widest font-bold text-center">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full relative group py-5 overflow-hidden transition-all disabled:opacity-50"
              style={{ backgroundColor: theme.gold }}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="relative flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-paper" style={{ color: theme.paper }}>
                {loading ? <Loader2 className="animate-spin" size={14} /> : (isLogin ? 'Sign In' : 'Register')}
                {!loading && <ArrowRight size={14} />}
              </span>
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full h-px bg-accent/10" /></div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-widest font-bold">
              <span className="bg-paper px-4 opacity-40" style={{ color: theme.muted, backgroundColor: theme.paper }}>OR CONTINUE WITH</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 bg-accent/5 flex items-center justify-center gap-3 hover:bg-accent/10 transition-all group disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.56z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: theme.ink }}>Google Account</span>
          </button>

          <button 
            type="button"
            onClick={onClose}
            className="w-full py-4 bg-ink text-paper flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-all group shadow-xl"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">Continue as Guest</span>
          </button>

          <p className="text-center text-[10px] font-bold uppercase tracking-widest opacity-40 transition-all hover:opacity-100" style={{ color: theme.muted }}>
            {isLogin ? "Don't have an account?" : "Already a member?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 underline font-sans text-gold" style={{ color: theme.gold }}
            >
              {isLogin ? 'Register Now' : 'Login Here'}
            </button>
          </p>

        </div>
      </motion.div>
    </div>
  );
};
