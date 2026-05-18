import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import { Post, Contributor } from '../types';
import { api } from '../services/api';
import { useApp } from '../App';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { formatDate } from '../lib/utils';
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import { Share2, Bookmark, Clock, ChevronLeft, Twitter, Linkedin, Heart, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { VerifiedBadge } from '../components/blog/VerifiedBadge';
import { ContributorBox } from '../components/blog/ContributorBox';
import CommentSection from '../components/blog/CommentSection';

export default function SinglePost() {
  const { slug } = useParams<{ slug: string }>();
  const { settings, user, login } = useApp();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [contributor, setContributor] = useState<Contributor | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await api.getPostBySlug(slug);
        if (data) {
          setPost(data);
          setLocalLikes(data.likesCount || 0);
          
          // Increment views
          await api.incrementViews(data.id);

          // Check if user liked
          if (user) {
            const liked = await api.hasLiked(data.id, user.uid);
            setHasLiked(liked);
          }

          if (data.contributorId) {
            const contributors = await api.getContributors();
            const found = contributors.find(c => c.id === data.contributorId);
            setContributor(found || null);
          }
          const allPosts = await api.getPosts('published');
          setRelatedPosts(allPosts.filter(p => p.id !== data.id).slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
    window.scrollTo(0, 0);
  }, [slug, user]);

  const handleLike = async () => {
    if (!user) {
      login();
      return;
    }
    if (!post) return;

    try {
      if (hasLiked) {
        setLocalLikes(prev => prev - 1);
        setHasLiked(false);
        await api.unlikePost(post.id, user.uid);
      } else {
        setLocalLikes(prev => prev + 1);
        setHasLiked(true);
        await api.likePost(post.id, user.uid);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Layout><div className="py-40 text-center">Loading article...</div></Layout>;
  if (!post) return <Layout><div className="py-40 text-center">Article not found.</div></Layout>;

  // Structured Data (Schema.org)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": [post.coverImage],
    "datePublished": post.publishedAt?.toDate ? post.publishedAt.toDate().toISOString() : post.publishedAt,
    "dateModified": post.updatedAt?.toDate ? post.updatedAt.toDate().toISOString() : post.updatedAt,
    "author": [
      {
        "@type": "Person",
        "name": contributor?.name || "Team Parallel Pages",
        "url": contributor ? `${window.location.origin}/voices` : `${window.location.origin}/about`
      },
      {
        "@type": "Organization",
        "name": "Team Parallel Pages",
        "url": `${window.location.origin}/about`
      }
    ],
    "publisher": {
      "@type": "Organization",
      "name": "Parallel Pages",
      "logo": {
        "@type": "ImageObject",
        "url": settings?.logoUrl || `${window.location.origin}/logo.png`
      }
    },
    "description": post.excerpt
  };

  return (
    <Layout>
      <Helmet>
        <title>{post.seo?.title || `${post.title} | ${settings?.siteName || 'Parallel Pages'}`}</title>
        <meta name="description" content={post.seo?.description || post.excerpt} />
        <meta property="og:title" content={post.seo?.title || post.title} />
        <meta property="og:description" content={post.seo?.description || post.excerpt} />
        <meta property="og:image" content={post.coverImage} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.seo?.title || post.title} />
        <meta name="twitter:description" content={post.seo?.description || post.excerpt} />
        <meta name="twitter:image" content={post.coverImage} />
        <link rel="canonical" href={`${window.location.origin}/blog/${post.slug}`} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
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
            <VerifiedBadge />
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-12">
            {post.title}
          </h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-8 border-y border-black/5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden">
                <img 
                  src={contributor?.image || settings?.authorImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=Team Parallel Pages`} 
                  alt={contributor?.name || "Team Parallel Pages"} 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <p className="font-bold text-lg">
                  Written by {contributor?.name || "Team Parallel Pages"}
                </p>
                <p className="text-sm text-black/40">
                  Reviewed & Published by Team Parallel Pages
                </p>
                <p className="text-xs text-black/30 mt-1">Published on {formatDate(post.publishedAt)}</p>
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

        <div className="aspect-[21/9] overflow-hidden rounded-3xl mb-20 bg-gray-100">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-black/20 font-serif italic">No cover image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="overflow-x-hidden">
          {post.content.trim().startsWith('<') ? (
            <div 
              className="prose prose-lg prose-headings:font-serif prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-3xl prose-blockquote:border-none ql-editor-content"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
            />
          ) : (
            <div className="prose prose-lg prose-headings:font-serif prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-3xl prose-blockquote:border-none">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          )}
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

        {/* Contributor Box */}
        {contributor && <ContributorBox contributor={contributor} />}

        {/* Engagement Bar */}
        <div className="mt-12 py-8 border-y border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 font-bold transition-all ${hasLiked ? 'text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className="relative">
                <Heart size={24} fill={hasLiked ? "currentColor" : "none"} className={hasLiked ? "animate-bounce" : ""} />
                <AnimatePresence>
                  {hasLiked && (
                    <motion.div
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 2, opacity: 0 }}
                      className="absolute inset-0 text-pink-400 pointer-events-none"
                    >
                      <Heart size={24} fill="currentColor" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span>{localLikes}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-400 hover:text-gray-600 font-bold">
              <MessageCircle size={24} />
              <span>{post.commentsCount || 0}</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest hidden sm:block">Share this story</span>
            <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors"><Twitter size={18}/></button>
            <button className="p-2 text-gray-400 hover:text-blue-700 transition-colors"><Linkedin size={18}/></button>
          </div>
        </div>

        {/* Author Bio (Fallback if no contributor) */}
        {!contributor && (
          <div className="mt-12 p-8 bg-gray-50 rounded-3xl flex flex-col md:flex-row gap-6 items-center text-center md:text-left">
            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden shrink-0">
              <img 
                src={settings?.authorImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=Team Parallel Pages`} 
                alt="Team Parallel Pages" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">Written by Team Parallel Pages</h3>
              <p className="text-sm text-black/60 leading-relaxed mb-4">
                {settings?.authorBio || "Parallel Pages is a curated platform for young builders and thinkers. Our team works to bring you the best insights on technology, creativity, and startups."}
              </p>
              <div className="flex justify-center md:justify-start gap-4">
                <Link to="/about" className="text-xs font-bold text-blue-600 hover:underline">View Profile</Link>
              </div>
            </div>
          </div>
        )}

        {/* Writer CTA */}
        {user?.role === 'reader' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-black text-white p-12 rounded-[2.5rem] relative overflow-hidden group"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/20 blur-3xl group-hover:bg-blue-600/30 transition-colors"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black">
                  <Sparkles size={16} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Contributor Network</p>
              </div>
              <h3 className="text-3xl font-serif font-bold mb-4">Have a story worth telling?</h3>
              <p className="text-gray-400 max-w-lg mb-8 leading-relaxed">
                Join our collective of meaningful writers. Publish your thoughts, reach your audience, and build your digital legacy on Parallel Pages.
              </p>
              <Link 
                to="/contact" 
                className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-blue-500 hover:text-white transition-all group/btn"
              >
                Apply to be a Writer <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Comment Section */}
        <CommentSection postId={post.id} />
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
                    {p.coverImage ? (
                      <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-black/20 text-xs">No image</div>
                    )}
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
