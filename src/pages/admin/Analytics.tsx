import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { analytics } from '../../services/analytics';
import { api } from '../../services/api';
import { AnalyticsMetrics, Post } from '../../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  Eye, Users, Clock, ArrowDownLeft, TrendingUp, Filter, 
  ChevronRight, Calendar, Globe, Search, Bell
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatDate } from '../../lib/utils';
import { Link } from 'react-router-dom';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminAnalytics() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [metricsData, postsData, subCount] = await Promise.all([
          analytics.getMetrics(timeRange),
          api.getPosts(),
          api.getSubscribersCount()
        ]);
        
        // Enrich top posts with actual titles
        const enrichedTopPosts = metricsData.topPosts.map(tp => {
          const post = postsData.find(p => p.slug === tp.slug);
          return { ...tp, title: post?.title || tp.slug };
        });
        
        setMetrics({ ...metricsData, topPosts: enrichedTopPosts });
        setPosts(postsData);
        setSubscribersCount(subCount);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  if (loading && !metrics) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-medium">Analyzing data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const stats = [
    { label: 'Total Page Views', value: metrics?.totalPageViews || 0, icon: Eye, color: 'bg-blue-500' },
    { label: 'Unique Visitors', value: metrics?.uniqueVisitors || 0, icon: Users, color: 'bg-green-500' },
    { label: 'Avg. Duration', value: `${Math.floor((metrics?.avgSessionDuration || 0) / 60)}m ${Math.floor((metrics?.avgSessionDuration || 0) % 60)}s`, icon: Clock, color: 'bg-purple-500' },
    { label: 'Total Subscribers', value: subscribersCount, icon: Bell, color: 'bg-orange-500' },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">Monitor your blog's performance and audience growth.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
          {[7, 30, 90].map(days => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                timeRange === days ? 'bg-black text-white' : 'text-gray-400 hover:text-black'
              }`}
            >
              Last {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg shadow-blue-100`}>
                <stat.icon size={20} />
              </div>
              <span className="text-green-500 text-xs font-bold flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                <TrendingUp size={12} /> +12%
              </span>
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-bold mt-1 text-gray-900">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Popular Posts */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={20} />
              Popular Articles
            </h3>
            <Link to="/admin/posts" className="text-xs font-bold text-gray-400 hover:text-black uppercase tracking-widest">
              Manage Content
            </Link>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.topPosts} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="title" 
                  type="category" 
                  width={150} 
                  tick={{ fontSize: 12, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="views" 
                  fill="#2563eb" 
                  radius={[0, 8, 8, 0]} 
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Globe className="text-green-600" size={20} />
              Traffic Sources
            </h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics?.trafficSources}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="source"
                >
                  {metrics?.trafficSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-4">
            {metrics?.trafficSources.slice(0, 4).map((source, i) => (
              <div key={source.source} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-sm font-medium text-gray-600 capitalize">{source.source}</span>
                </div>
                <span className="text-sm font-bold">{source.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm mb-8">
        <h3 className="text-xl font-bold mb-8">Performance Overview</h3>
        <div className="h-[300px]">
          <p className="text-center text-gray-400 py-20 italic">
            Visualizing trends over time... (Requires daily aggregated data)
          </p>
          {/* Note: In a real app we'd have a line chart showing page views per day */}
        </div>
      </div>
    </AdminLayout>
  );
}
