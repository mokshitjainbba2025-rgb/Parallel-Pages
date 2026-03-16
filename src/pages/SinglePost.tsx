import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Post } from '../types';
import { api } from '../services/api';
import { useApp } from '../App';
import { motion, useScroll, useSpring } from 'motion/react';
import { formatDate } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { Share2, Bookmark, MessageCircle, Clock, ChevronLeft, Twitter, Linkedin, Facebook } from 'lucide-react';

export default function SinglePost() {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useApp();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      try {
        const data = await api.getPost(slug);
        setPost(data);

        const allPosts = await api.getPosts();
        setRelatedPosts(allPosts.filter(p => p.id !== data.id && p.status === 'published').slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <Layout><div className="py-40 text-center">Loading article...</div></Layout>;
  if (!post) return <Layout><div className="py-40 text-center">Article not found.</div></Layout>;

  return (
    <Layout>
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-20 left-0 right-0 h-1 bg-blue-600 origin-left z-50"
        style={{ scaleX }}
      />

      <article className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-black/40 hover:text-black transition-colors mb-12">
          <ChevronLeft size={16} /> Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              {post.category}
            </span>
            <span className="text-sm text-black/40 flex items-center gap-1">
              <Clock size={14} /> {post.readingTime} min read
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-12">
            {post.title}
          </h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-8 border-y border-black/5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden">
                <img src={settings?.authorImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName}`} alt={post.authorName} />
              </div>
              <div>
                <p className="font-bold text-lg">{settings?.authorName || post.authorName}</p>
                <p className="text-sm text-black/40">Published on {formatDate(post.publishedAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-3 rounded-full border border-black/5 hover:bg-gray-50 transition-colors text-black/40 hover:text-black">
                <Twitter size={20} />
              </button>
              <button className="p-3 rounded-full border border-black/5 hover:bg-gray-50 transition-colors text-black/40 hover:text-black">
                <Linkedin size={20} />
              </button>
              <button className="p-3 rounded-full border border-black/5 hover:bg-gray-50 transition-colors text-black/40 hover:text-black">
                <Share2 size={20} />
              </button>
              <button className="p-3 rounded-full border border-black/5 hover:bg-gray-50 transition-colors text-black/40 hover:text-black">
                <Bookmark size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        <div className="aspect-[21/9] overflow-hidden rounded-3xl mb-20 bg-gray-100">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-3xl prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50/50 prose-blockquote:p-8 prose-blockquote:rounded-r-3xl prose-blockquote:italic prose-blockquote:text-2xl prose-blockquote:font-serif">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* Tags */}
        <div className="mt-20 pt-12 border-t border-black/5">
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="bg-gray-100 text-black/60 px-4 py-2 rounded-full text-sm font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Author Bio */}
        <div className="mt-20 p-12 bg-gray-50 rounded-3xl flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden shrink-0">
            <img src={settings?.authorImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName}`} alt={post.authorName} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Written by {settings?.authorName || post.authorName}</h3>
            <p className="text-black/60 leading-relaxed mb-6">
              {settings?.authorBio || "Mokshit is a builder and storyteller focused on the intersection of technology and creativity. He documents his journey to help other young builders navigate the startup world."}
            </p>
            <div className="flex justify-center md:justify-start gap-4">
              {settings?.socialLinks.twitter && <a href={settings.socialLinks.twitter} className="text-sm font-bold text-blue-600 hover:underline">Follow on Twitter</a>}
              <Link to="/about" className="text-sm font-bold text-blue-600 hover:underline">View Profile</Link>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-32 pt-20 border-t border-black/5">
          <h2 className="text-3xl font-serif font-bold mb-12">Continue Reading</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {relatedPosts.map(p => (
              <div key={p.id}>
                <Link to={`/blog/${p.slug}`}>
                  <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 mb-6">
                    <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-2 hover:text-blue-600 transition-colors leading-tight">{p.title}</h3>
                </Link>
                <p className="text-sm text-black/40">{formatDate(p.publishedAt)}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}
