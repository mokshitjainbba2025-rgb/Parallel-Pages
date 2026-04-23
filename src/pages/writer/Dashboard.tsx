import React, { useEffect, useState } from 'react';
import WriterLayout from '../../components/WriterLayout';
import { api } from '../../services/api';
import { useApp } from '../../App';
import { Post } from '../../types';
import { FileText, Eye, Heart, MessageCircle, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { formatDate } from '../../lib/utils';
import { Link } from 'react-router-dom';

export default function WriterDashboard() {
  const { user } = useApp();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchPosts = async () => {
      try {
        const data = await api.getPostsByAuthor(user.uid);
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [user]);

  const stats = [
    { label: 'My Stories', value: posts.length, icon: FileText, color: 'bg-blue-500' },
    { label: 'Total Views', value: posts.reduce((acc, p) => acc + (p.viewsCount || 0), 0), icon: Eye, color: 'bg-green-500' },
    { label: 'Total Likes', value: posts.reduce((acc, p) => acc + (p.likesCount || 0), 0), icon: Heart, color: 'bg-pink-500' },
    { label: 'Comments', value: posts.reduce((acc, p) => acc + (p.commentsCount || 0), 0), icon: MessageCircle, color: 'bg-purple-500' },
  ];

  return (
    <WriterLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg`}>
                <stat.icon size={20} />
              </div>
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold">Recent Stories</h3>
            <Link to="/writer/posts" className="text-sm text-blue-600 font-bold">Manage All</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {posts.length > 0 ? (
              posts.slice(0, 5).map((post) => (
                <div key={post.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                      {post.coverImage ? (
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><FileText size={20}/></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm line-clamp-1">{post.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(post.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      post.status === 'published' ? 'bg-green-50 text-green-600' :
                      post.status === 'submitted' ? 'bg-blue-50 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {post.status}
                    </span>
                    <Link to={`/writer/edit/${post.id}`} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg">Edit</Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center text-gray-400">
                <p>No stories yet. Start writing your masterpiece!</p>
                <Link to="/writer/new" className="inline-block mt-4 text-blue-600 font-bold">Create Story →</Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200">
          <TrendingUp size={48} className="mb-6 opacity-20" />
          <h3 className="text-xl font-bold mb-4">Platform Insights</h3>
          <p className="text-blue-100 text-sm mb-8 leading-relaxed">
            Published stories with 1,000+ words receive 40% more engagement. Try adding a personal touch!
          </p>
          <div className="space-y-4">
            <div className="bg-blue-500/30 p-4 rounded-2xl flex items-center gap-4">
              <Clock size={20} className="text-blue-200" />
              <div>
                <p className="text-xs font-bold text-blue-200 uppercase tracking-widest">Avg. Goal</p>
                <p className="text-sm font-bold">2 Stories / Week</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WriterLayout>
  );
}
