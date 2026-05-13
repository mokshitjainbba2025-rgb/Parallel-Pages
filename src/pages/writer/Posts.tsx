import React, { useEffect, useState } from 'react';
import WriterLayout from '../../components/WriterLayout';
import { api } from '../../services/api';
import { useApp } from '../../App';
import { Post } from '../../types';
import { FileText, MoreVertical, Edit3, Trash2, Send, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { formatDate } from '../../lib/utils';
import { Link } from 'react-router-dom';

export default function WriterPosts() {
  const { user } = useApp();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchPosts();
  }, [user]);

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

  const handleSubmit = async (postId: string) => {
    if (!window.confirm('Submit this story for review?')) return;
    try {
      await api.updatePostStatus(postId, 'submitted');
      await fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle2 size={14} className="text-green-500" />;
      case 'submitted': return <Clock size={14} className="text-blue-500" />;
      case 'rejected': return <XCircle size={14} className="text-red-500" />;
      default: return <FileText size={14} className="text-gray-400" />;
    }
  };

  return (
    <WriterLayout>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">My Stories</h1>
          <p className="text-gray-400 mt-1">Manage, edit, and track your content submissions.</p>
        </div>
        <Link 
          to="/writer/new" 
          className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-black/10"
        >
          Write New Story
        </Link>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Story Title</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Created</th>
              <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {posts.map((post, index) => (
              <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                      {post.coverImage ? (
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <FileText size={18} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm tracking-tight">{post.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">{post.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-200/50 border border-black/5 text-[10px] font-bold uppercase tracking-widest text-black/60 relative group">
                    {getStatusIcon(post.status)}
                    {post.status}
                    {post.status === 'rejected' && post.rejectionReason && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-black text-white text-[10px] normal-case font-normal rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                        <p className="font-bold mb-1 uppercase tracking-widest text-[8px] text-red-400">Feedback:</p>
                        {post.rejectionReason}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {post.status === 'draft' && (
                      <button 
                        onClick={() => handleSubmit(post.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Submit for Review"
                      >
                        <Send size={18} />
                      </button>
                    )}
                    <Link 
                      to={`/writer/edit/${post.id}`} 
                      className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={18} />
                    </Link>
                    {(post.status === 'draft' || post.status === 'rejected') && (
                      <button 
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
                            try {
                              setLoading(true);
                              await api.deletePost(post.id);
                              await fetchPosts();
                            } catch (err) {
                              console.error(err);
                            } finally {
                              setLoading(false);
                            }
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Story"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && !loading && (
          <div className="p-20 text-center text-gray-400 italic">
            You haven't written any stories yet.
          </div>
        )}
      </div>
    </WriterLayout>
  );
}
