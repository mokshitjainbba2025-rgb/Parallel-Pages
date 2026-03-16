import React, { useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'motion/react';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.subscribe(email);
      setSubmitted(true);
    } catch (err) {
      alert('Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-20">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8"
          >
            <Mail size={32} />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">The Parallel Circle</h1>
          <p className="text-xl text-black/60 max-w-2xl mx-auto leading-relaxed">
            Join 1,200+ creators and builders receiving weekly insights on entrepreneurship, student life, and the art of documenting the journey.
          </p>
        </div>

        <div className="bg-gray-50 p-12 md:p-20 rounded-[3rem] border border-black/5">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-3xl font-serif font-bold mb-4">You're in!</h2>
              <p className="text-black/60 mb-8">Check your inbox for a welcome message from us.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-blue-600 font-bold hover:underline"
              >
                Back to newsletter
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg"
                  placeholder="name@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-600 transition-all disabled:opacity-50 group"
              >
                {loading ? 'Joining...' : 'Join the Circle'}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-center text-xs text-black/40">
                By subscribing, you agree to our Privacy Policy and consent to receive updates from Parallel Pages.
              </p>
            </form>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20">
          <div className="text-center">
            <h3 className="font-bold mb-2">Weekly Insights</h3>
            <p className="text-sm text-black/40">Deep dives into startup culture and student life.</p>
          </div>
          <div className="text-center">
            <h3 className="font-bold mb-2">Exclusive Content</h3>
            <p className="text-sm text-black/40">Early access to guides, templates, and case studies.</p>
          </div>
          <div className="text-center">
            <h3 className="font-bold mb-2">Community First</h3>
            <p className="text-sm text-black/40">Connect with other like-minded builders and creators.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
