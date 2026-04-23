import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, ArrowRight, Github } from 'lucide-react';
import { useApp } from '../App';

export default function FloatingCTA() {
  const { user, login } = useApp();
  const [isVisible, setIsVisible] = useState(false);
  const [hasClosed, setHasClosed] = useState(false);

  useEffect(() => {
    // Show CTA after a delay or scroll
    const timer = setTimeout(() => {
      if (!user && !hasClosed) {
        setIsVisible(true);
      }
    }, 5000);

    const handleScroll = () => {
      if (window.scrollY > 1000 && !user && !hasClosed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [user, hasClosed]);

  if (user || hasClosed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-8 right-8 z-50 max-w-xs w-full"
        >
          <div className="relative bg-white rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden group">
            {/* Animated Background Pulse */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-50 rounded-full blur-3xl group-hover:bg-blue-100 transition-colors duration-700"></div>
            
            <button 
              onClick={() => {
                setIsVisible(false);
                setHasClosed(true);
              }}
              className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/20">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">Join the Collective</p>
            </div>

            <h3 className="text-xl font-bold leading-tight mb-2">
              ✨ Join Parallel Pages
            </h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Read meaningfully. Write deeply. Build a brand that matters.
            </p>

            <button
              onClick={() => login()}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 transition-all group/btn"
            >
              Get Started <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
            </button>

            <p className="text-[10px] text-center text-gray-400 mt-4">
              Join 1,200+ creators and readers
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
