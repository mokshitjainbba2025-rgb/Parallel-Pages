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
        const data = await api.getPublishedPosts();
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
                  <img
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
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
                  <img src={settings?.authorImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${featuredPost.authorName}`} alt={featuredPost.authorName} />
                </div>
                <div>
                  <p className="text-sm font-bold">{settings?.authorName || featuredPost.authorName}</p>
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
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
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
                  <img src={settings?.authorImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName}`} alt={post.authorName} />
                </div>
                <p className="text-xs font-bold">{settings?.authorName || post.authorName}</p>
              </div>
            </motion.div>
          ))}
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
