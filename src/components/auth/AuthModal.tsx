import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowLeft, Mail, Github, Sparkles, BookOpen, PenTool, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../App';
import { useNavigate } from 'react-router-dom';

type ModalState = 'login' | 'role-selection' | 'reader-auth' | 'writer-signup' | 'writer-login' | 'upgrade';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [state, setState] = useState<ModalState>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, refreshUser } = useApp();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  if (!isOpen) return null;

  const handleBack = () => {
    setState('login');
    setError(null);
  };

  const handleSuccess = (profile: any) => {
    onClose();
    if (profile.role === 'admin') navigate('/admin');
    else if (profile.role === 'writer') navigate('/writer');
    else navigate('/');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.loginWithGoogle();
      if (result) handleSuccess(result.profile);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (state === 'login' || state === 'reader-auth' || state === 'writer-login') {
        const result = await api.loginWithEmail(email, password);
        handleSuccess(result.profile);
      } else if (state === 'writer-signup') {
        const result = await api.signupWithEmail({ email, password, name, role: 'writer', bio });
        handleSuccess(result.profile);
      } else if (state === 'upgrade') {
        if (user) {
          await api.upgradeToWriter(user.uid, bio, user.displayName);
          await refreshUser();
          navigate('/writer');
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (state) {
      case 'login':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-serif font-bold mb-2">Welcome Back</h2>
              <p className="text-gray-500">Sign in to Parallel Pages</p>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 border-2 border-gray-100 rounded-2xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-white px-2 text-gray-400">Or use email</span></div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <input 
                type="email" placeholder="Email" required 
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all"
                value={email} onChange={e => setEmail(e.target.value)}
              />
              <input 
                type="password" placeholder="Password" required 
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all"
                value={password} onChange={e => setPassword(e.target.value)}
              />
              <button 
                 type="submit" disabled={loading}
                 className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Log In'}
              </button>
            </form>

            <div className="pt-8 border-t border-gray-100 flex flex-col gap-4">
              <p className="text-center text-sm text-gray-400 font-medium">New to Parallel Pages?</p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setState('role-selection')}
                  className="px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
                >
                  Join as Reader
                </button>
                <button 
                  onClick={() => setState('writer-signup')}
                  className="px-4 py-3 bg-gray-50 text-black rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors"
                >
                  Become a Writer
                </button>
              </div>
            </div>
          </div>
        );

      case 'role-selection':
        return (
          <div className="space-y-6">
            <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors mb-4">
              <ArrowLeft size={16} /> Back to login
            </button>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-bold mb-2">Join the Collective</h2>
              <p className="text-gray-500">Pick your path in our creative ecosystem.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => {
                  if (user?.role === 'reader') setState('upgrade');
                  else if (user?.role === 'writer' || user?.role === 'admin') handleSuccess(user);
                  else setState('reader-auth');
                }}
                className="group relative flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border-2 border-transparent hover:border-blue-600 transition-all text-left"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <BookOpen size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Continue as Reader</h3>
                  <p className="text-gray-500 text-sm">Explore stories, bookmark ideas, and join community chats.</p>
                </div>
              </button>

              <button 
                onClick={() => {
                  if (user?.role === 'reader') setState('upgrade');
                  else if (user?.role === 'writer' || user?.role === 'admin') handleSuccess(user);
                  else setState('writer-signup');
                }}
                className="group relative flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border-2 border-transparent hover:border-black transition-all text-left"
              >
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <PenTool size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Become a Writer</h3>
                  <p className="text-gray-500 text-sm">Share your thoughts, document growth, and build your brand.</p>
                </div>
              </button>
            </div>
          </div>
        );

      case 'reader-auth':
        return (
          <div className="space-y-6">
            <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors mb-4">
              <ArrowLeft size={16} /> Back to roles
            </button>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-bold mb-2">Welcome Back</h2>
              <p className="text-gray-500">Sign in to your reader account</p>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 border-2 border-gray-100 rounded-2xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-white px-2 text-gray-400">Or use email</span></div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <input 
                type="email" placeholder="Email" required 
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all"
                value={email} onChange={e => setEmail(e.target.value)}
              />
              <input 
                type="password" placeholder="Password" required 
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all"
                value={password} onChange={e => setPassword(e.target.value)}
              />
              <button 
                 type="submit" disabled={loading}
                 className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
              </button>
            </form>
          </div>
        );

      case 'writer-signup':
      case 'upgrade':
        return (
          <div className="space-y-6">
            <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors mb-4">
              <ArrowLeft size={16} /> Back
            </button>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-bold mb-2">
                {state === 'upgrade' ? 'Upgrade to Writer' : 'Create Writer Account'}
              </h2>
              <p className="text-gray-500">Apply to join our community of contributors</p>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {state !== 'upgrade' && (
                <>
                  <input 
                    type="text" placeholder="Full Name" required 
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all"
                    value={name} onChange={e => setName(e.target.value)}
                  />
                  <input 
                    type="email" placeholder="Email" required 
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all"
                    value={email} onChange={e => setEmail(e.target.value)}
                  />
                  <input 
                    type="password" placeholder="Password" required 
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all"
                    value={password} onChange={e => setPassword(e.target.value)}
                  />
                </>
              )}
              <textarea 
                placeholder="Short Bio - Tell us who you are" required 
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all min-h-[100px]"
                value={bio} onChange={e => setBio(e.target.value)}
              />
              <button 
                 type="submit" disabled={loading}
                 className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : state === 'upgrade' ? 'Upgrade Profile' : 'Join as Writer'}
              </button>
            </form>

            {state === 'writer-signup' && (
              <p className="text-center text-sm text-gray-500">
                Already have an account? <button onClick={() => setState('writer-login')} className="text-black font-bold hover:underline">Login here</button>
              </p>
            )}
          </div>
        );

      case 'writer-login':
        return (
          <div className="space-y-6">
            <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors mb-4">
              <ArrowLeft size={16} /> Back to signup
            </button>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-bold mb-2">Writer Login</h2>
              <p className="text-gray-500">Access your creative workspace</p>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <input 
                type="email" placeholder="Email" required 
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all"
                value={email} onChange={e => setEmail(e.target.value)}
              />
              <input 
                type="password" placeholder="Password" required 
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all"
                value={password} onChange={e => setPassword(e.target.value)}
              />
              <button 
                 type="submit" disabled={loading}
                 className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Login'}
              </button>
            </form>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        layoutId="auth-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 text-gray-400 hover:text-black transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="px-10 py-12">
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-start gap-3"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={state}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
