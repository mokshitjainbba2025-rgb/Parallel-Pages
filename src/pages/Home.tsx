import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import { Post } from '../types';
import { api } from '../services/api';
import { useApp } from '../App';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { formatDate, calculateReadingTime } from '../lib/utils';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const { settings } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await api.getPosts('published');
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const featuredPost = posts[0];
  const latestPosts = posts.slice(1, 4);

  return (
    <Layout>
      <Helmet>
        <title>{settings?.siteName || 'Parallel Pages'} | Stories that parallel your journey</title>
        <meta name="description" content={settings?.siteDescription || 'A minimalist space for entrepreneurs, builders, and lifelong learners to share insights and document growth.'} />
        <meta property="og:title" content={settings?.siteName || 'Parallel Pages'} />
        <meta property="og:description" content={settings?.siteDescription || 'A minimalist space for entrepreneurs, builders, and lifelong learners to share insights and document growth.'} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={window.location.origin} />
      </Helmet>
      {/* Hero Section */}
      <section className="mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <h1 className="text-6xl md:text-8xl font-serif font-bold leading-tight mb-8">
            Stories that <span className="italic text-blue-600 underline decoration-blue-200 underline-offset-8">parallel</span> your journey.
          </h1>
          <p className="text-xl md:text-2xl text-black/60 leading-relaxed max-w-2xl mb-12">
            A minimalist space for entrepreneurs, builders, and lifelong learners to share insights and document growth.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/blog" className="bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-blue-600 transition-all flex items-center gap-2 group">
              Start Reading <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/about" className="border border-black/10 px-8 py-4 rounded-full font-bold hover:bg-gray-50 transition-all">
              Our Story
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="mb-24">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/2">
              <Link to={`/blog/${featuredPost.slug}`}>
                <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100">
                  {featuredPost.coverImage ? (
                    <img
                      src={featuredPost.coverImage}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-black/20 font-serif italic">No image</div>
                  )}
                </div>
              </Link>
            </div>
            <div className="w-full md:w-1/2">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600">{featuredPost.category}</span>
                <span className="text-xs text-black/40">{formatDate(featuredPost.publishedAt)}</span>
              </div>
              <Link to={`/blog/${featuredPost.slug}`}>
                <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 hover:text-blue-600 transition-colors">
                  {featuredPost.title}
                </h2>
              </Link>
              <p className="text-lg text-black/60 leading-relaxed mb-8">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <img src={settings?.authorImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=Team Parallel Pages`} alt="Team Parallel Pages" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <p className="text-sm font-bold">
                    {(settings?.authorName && settings.authorName !== 'Mokshit Jain') ? settings.authorName : "Team Parallel Pages"}
                  </p>
                  <p className="text-xs text-black/40">{featuredPost.readingTime} min read</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Posts Grid */}
      <section className="mb-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-2">Latest Insights</h2>
            <p className="text-black/40">Fresh perspectives from our community.</p>
          </div>
          <Link to="/blog" className="text-sm font-bold text-blue-600 hover:underline">View All Posts →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {latestPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/blog/${post.slug}`}>
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 mb-6">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-black/20 font-serif italic text-xs">No image</div>
                  )}
                </div>
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{post.category}</span>
                <span className="text-[10px] text-black/40">{formatDate(post.publishedAt)}</span>
              </div>
              <Link to={`/blog/${post.slug}`}>
                <h3 className="text-xl font-serif font-bold mb-4 hover:text-blue-600 transition-colors leading-tight">
                  {post.title}
                </h3>
              </Link>
              <p className="text-sm text-black/60 line-clamp-2 mb-6">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                  <img src={settings?.authorImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=Team Parallel Pages`} alt="Team Parallel Pages" referrerPolicy="no-referrer" />
                </div>
                <p className="text-xs font-bold">
                  {(settings?.authorName && settings.authorName !== 'Mokshit Jain') ? settings.authorName : "Team Parallel Pages"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="mb-24 py-16 border-y border-black/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <p className="text-4xl font-serif font-bold mb-2">1,200+</p>
            <p className="text-xs text-black/40 uppercase font-bold tracking-widest">Readers</p>
          </div>
          <div>
            <p className="text-4xl font-serif font-bold mb-2">45+</p>
            <p className="text-xs text-black/40 uppercase font-bold tracking-widest">Writers</p>
          </div>
          <div>
            <p className="text-4xl font-serif font-bold mb-2">150+</p>
            <p className="text-xs text-black/40 uppercase font-bold tracking-widest">Stories</p>
          </div>
          <div>
            <p className="text-4xl font-serif font-bold mb-2">5.2k</p>
            <p className="text-xs text-black/40 uppercase font-bold tracking-widest">Shares</p>
          </div>
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          viewport={{ once: true }}
          className="text-sm text-black/40 mt-8 max-w-lg mx-auto leading-relaxed font-medium italic text-center"
        >
          “We’re building towards this. Our story is in progress—yours deserves to be told today.”
        </motion.p>
      </section>

      {/* Community Section */}
      <section className="mb-24">
        <div className="bg-blue-600 rounded-[2.5rem] p-12 md:p-20 text-white relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 blur-3xl rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
                Beyond the screen. <br/> Join the collective.
              </h2>
              <p className="text-blue-100 text-lg mb-10 leading-relaxed max-w-md">
                Our WhatsApp community is where the real conversations happen. Connect with other builders, discuss stories, and stay updated.
              </p>
              <a 
                href="https://chat.whatsapp.com/H8KlvMtgnt6Cn7SOyQFMcA" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-3 bg-white text-blue-600 px-10 py-5 rounded-3xl font-bold hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20"
              >
                Join WhatsApp Group <ArrowRight size={20} />
              </a>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-white/20 rounded-[2rem] backdrop-blur-md border border-white/30 p-8 flex flex-col justify-between">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-blue-600 bg-gray-200 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="Member" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">150+</p>
                    <p className="text-sm text-blue-200">Active Members</p>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-green-400 text-black px-4 py-2 rounded-xl text-xs font-bold shadow-lg">
                  LIVE NOW ⚡️
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-black text-white rounded-3xl p-12 md:p-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Join the Parallel Circle</h2>
          <p className="text-white/60 text-lg mb-10">
            Get weekly insights on entrepreneurship, student life, and personal growth delivered straight to your inbox.
          </p>
          <form className="flex flex-col md:flex-row gap-4" onSubmit={(e) => {
            e.preventDefault();
            const email = (e.target as any).email.value;
            api.subscribe(email).then(() => alert('Subscribed successfully!'));
            (e.target as any).reset();
          }}>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              required
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-4 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button type="submit" className="bg-blue-600 text-white px-10 py-4 rounded-full font-bold hover:bg-blue-700 transition-all">
              Subscribe
            </button>
          </form>
          <p className="text-white/40 text-xs mt-6">No spam, just value. Unsubscribe anytime.</p>
        </div>
      </section>
    </Layout>
  );
}
