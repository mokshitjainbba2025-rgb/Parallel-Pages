import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import { Contributor, Post } from '../types';
import { api } from '../services/api';
import { useApp } from '../App';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronRight, Twitter, Linkedin, Globe } from 'lucide-react';

export default function Voices() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const { settings } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contributorsData, postsData] = await Promise.all([
          api.getContributors(),
          api.getPublishedPosts()
        ]);
        setContributors(contributorsData);
        setPosts(postsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Layout>
      <Helmet>
        <title>Voices of Parallel Pages | Contributors</title>
        <meta name="description" content="Meet the real operators and storytellers behind Parallel Pages. Real stories from the ground." />
      </Helmet>

      <header className="mb-20">
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8">Voices of Parallel Pages</h1>
        <p className="text-xl text-black/60 max-w-2xl font-serif italic leading-relaxed">
          "A curated platform for real experiences. We bring you insights from the operators who are building the future, one story at a time."
        </p>
      </header>

      {loading ? (
        <div className="py-40 text-center">Loading our voices...</div>
      ) : (
        <div className="space-y-32">
          {contributors.map((contributor, index) => {
            const contributorPosts = posts.filter(p => p.contributorId === contributor.id);
            
            return (
              <motion.section 
                key={contributor.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
              >
                <div className="lg:col-span-4">
                  <div className="sticky top-32">
                    <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100 mb-8 border border-black/5">
                      <img 
                        src={contributor.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${contributor.name}`} 
                        alt={contributor.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h2 className="text-3xl font-serif font-bold mb-4">{contributor.name}</h2>
                    <p className="text-black/60 leading-relaxed mb-8">
                      {contributor.bio}
                    </p>
                    <div className="flex gap-4">
                      {contributor.social?.twitter && (
                        <a href={contributor.social.twitter} className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition-all">
                          <Twitter size={18} />
                        </a>
                      )}
                      {contributor.social?.linkedin && (
                        <a href={contributor.social.linkedin} className="p-2 rounded-full bg-gray-100 hover:bg-blue-700 hover:text-white transition-all">
                          <Linkedin size={18} />
                        </a>
                      )}
                      {contributor.social?.website && (
                        <a href={contributor.social.website} className="p-2 rounded-full bg-gray-100 hover:bg-black hover:text-white transition-all">
                          <Globe size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8">
                  <div className="border-l border-black/5 pl-8 md:pl-12">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-black/30 mb-12">
                      Stories by {contributor.name}
                    </h3>
                    
                    {contributorPosts.length > 0 ? (
                      <div className="space-y-16">
                        {contributorPosts.map(post => (
                          <div key={post.id} className="group">
                            <Link to={`/blog/${post.slug}`} className="block">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-4 block">
                                {post.category}
                              </span>
                              <h4 className="text-2xl md:text-3xl font-serif font-bold mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                                {post.title}
                              </h4>
                              <p className="text-black/60 line-clamp-2 mb-6 leading-relaxed">
                                {post.excerpt}
                              </p>
                              <div className="flex items-center gap-2 text-sm font-bold group-hover:gap-4 transition-all">
                                Read Story <ChevronRight size={16} />
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-black/40 italic">No stories published yet. Stay tuned.</p>
                    )}
                  </div>
                </div>
              </motion.section>
            );
          })}
        </div>
      )}

      {/* Join the Voices CTA */}
      <section className="mt-40 py-24 bg-black text-white rounded-[3rem] text-center px-8">
        <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8">Have a story to tell?</h2>
        <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12 font-serif italic">
          "We are always looking for real operators with real stories. If you've been on the ground and have insights to share, we want to hear from you."
        </p>
        <Link 
          to="/contact" 
          className="inline-block bg-white text-black px-12 py-5 rounded-full font-bold text-lg hover:bg-blue-600 hover:text-white transition-all"
        >
          Become a Voice
        </Link>
      </section>
    </Layout>
  );
}
