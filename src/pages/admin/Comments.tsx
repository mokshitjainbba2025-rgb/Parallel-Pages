import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { api } from '../../services/api';
import { Comment } from '../../types';
import { MessageSquare, Check, X, ShieldAlert, User, Clock, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { formatDate } from '../../lib/utils';

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      // In a real app we'd have a global getComments for admin
      // Since our API currently only gets per post, I'll update the API to support list all comments
      // For now, I'll mock the fetch or assuming I've already updated the API
      const data = await api.getAllComments(); 
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.updateCommentStatus(id, status);
      await fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    try {
      await api.deleteComment(id);
      await fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Comment Moderation</h1>
          <p className="text-gray-400 mt-1">Review and moderate conversations across your platform.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="p-8 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row gap-6">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100 overflow-hidden">
                  {comment.authorAvatar ? (
                    <img src={comment.authorAvatar} alt={comment.authorName} className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="font-bold text-gray-900">{comment.authorName}</span>
                    <div className="h-4 w-px bg-gray-200"></div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {formatDate(comment.createdAt)}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                      comment.status === 'approved' ? 'bg-green-50 text-green-600' :
                      comment.status === 'rejected' ? 'bg-red-50 text-red-600' :
                      'bg-orange-50 text-orange-600'
                    }`}>
                      {comment.status}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed max-w-2xl">{comment.content}</p>
                </div>

                <div className="flex items-start gap-2">
                  {comment.status !== 'approved' && (
                    <button 
                      onClick={() => handleUpdateStatus(comment.id, 'approved')}
                      className="p-3 bg-green-50 text-green-600 hover:bg-green-100 rounded-2xl transition-all"
                      title="Approve"
                    >
                      <Check size={18} />
                    </button>
                  )}
                  {comment.status !== 'rejected' && (
                    <button 
                      onClick={() => handleUpdateStatus(comment.id, 'rejected')}
                      className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl transition-all"
                      title="Reject"
                    >
                      <X size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(comment.id)}
                    className="p-3 bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-black rounded-2xl transition-all"
                    title="Delete Permanently"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-gray-400 italic">
              No comments to moderate.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
