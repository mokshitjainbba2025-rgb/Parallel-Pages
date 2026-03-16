import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { api } from '../../services/api';
import { Post } from '../../types';
import { FileText, Users, Eye, TrendingUp, Plus, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { formatDate } from '../../lib/utils';

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await api.getPosts();
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const stats = [
    { label: 'Total Posts', value: posts.length, icon: FileText, color: 'bg-blue-500' },
    { label: 'Published', value: posts.filter(p => p.status === 'published').length, icon: Eye, color: 'bg-green-500' },
    { label: 'Drafts', value: posts.filter(p => p.status === 'draft').length, icon: TrendingUp, color: 'bg-orange-500' },
    { label: 'Subscribers', value: '124', icon: Users, color: 'bg-purple-500' },
  ];

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={stat.color + " p-3 rounded-2xl text-white"}>
                <stat.icon size={20} />
              </div>
              <span className="text-green-500 text-xs font-bold flex items-center gap-1">
                +12% <ArrowUpRight size={12} />
              </span>
            </div>
            <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
            <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Posts */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold">Recent Posts</h3>
            <Link to="/admin/posts" className="text-sm text-blue-600 font-bold hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {posts.slice(0, 5).map((post) => (
              <div key={post.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm line-clamp-1">{post.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(post.publishedAt)} • {post.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    post.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {post.status}
                  </span>
                  <Link to={`/admin/posts?edit=${post.id}`} className="p-2 text-gray-400 hover:text-black transition-colors">
                    <Plus size={18} className="rotate-45" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-black text-white p-8 rounded-3xl shadow-xl shadow-black/20">
            <h3 className="text-xl font-bold mb-4">Create New Story</h3>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              Share your latest insights and stories with your audience.
            </p>
            <Link to="/admin/posts?new=true" className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all">
              <Plus size={20} /> New Post
            </Link>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold mb-6">Site Health</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">SEO Score</span>
                  <span className="font-bold">92%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[92%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Load Speed</span>
                  <span className="font-bold">1.2s</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[98%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
