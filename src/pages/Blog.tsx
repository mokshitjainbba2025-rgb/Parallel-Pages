import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Post } from '../types';
import { api } from '../services/api';
import { useApp } from '../App';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { formatDate } from '../lib/utils';
import { Search, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const { settings } = useApp();
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await api.getPosts();
        const published = data.filter(p => p.status === 'published');
        setPosts(published);
        setFilteredPosts(published);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    let result = posts;

    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }

    if (searchQuery) {
      result = result.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredPosts(result);
  }, [searchQuery, activeCategory, posts]);

  const categories = ['All', ...new Set(posts.map(p => p.category))];

  return (
    <Layout>
      <header className="mb-16">
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8">The Blog</h1>
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all",
                  activeCategory === cat
                    ? "bg-black text-white"
                    : "bg-gray-100 text-black/60 hover:bg-gray-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={18} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/3] bg-gray-200 rounded-xl mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <Link to={`/blog/${post.slug}`}>
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 mb-8">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </Link>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{post.category}</span>
                <span className="text-[10px] text-black/40 font-medium">{formatDate(post.publishedAt)}</span>
              </div>
              <Link to={`/blog/${post.slug}`}>
                <h2 className="text-2xl font-serif font-bold mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                  {post.title}
                </h2>
              </Link>
              <p className="text-black/60 leading-relaxed mb-8 line-clamp-3">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between pt-6 border-t border-black/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    <img src={settings?.authorImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName}`} alt={post.authorName} />
                  </div>
                  <span className="text-xs font-bold">{settings?.authorName || post.authorName}</span>
                </div>
                <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">{post.readingTime} min read</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-40 bg-gray-50 rounded-3xl">
          <Search className="mx-auto text-black/20 mb-6" size={48} />
          <h2 className="text-2xl font-serif font-bold mb-2">No articles found</h2>
          <p className="text-black/40">Try adjusting your search or filters.</p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
            className="mt-8 text-blue-600 font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </Layout>
  );
}
