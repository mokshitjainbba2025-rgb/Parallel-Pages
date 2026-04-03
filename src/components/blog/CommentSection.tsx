import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Trash2, Reply, Shield, AlertCircle } from 'lucide-react';
import { useApp } from '../../App';
import { api } from '../../services/api';
import { Comment } from '../../types';
import { formatDate } from '../../lib/utils';
import { Link } from 'react-router-dom';

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user, login } = useApp();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await api.getComments(postId);
        setComments(data);
      } catch (err) {
        console.error('Failed to fetch comments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if (!user) return;
    if (!user.isSubscriber && user.role !== 'admin') {
      setError('Only subscribers can join the conversation.');
      return;
    }

    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const commentData: Partial<Comment> = {
        postId,
        content: content.trim(),
        authorId: user.uid,
        authorName: (user.role === 'admin' && parentId) ? 'Team Parallel Pages' : user.displayName,
        authorAvatar: user.photoURL,
        parentCommentId: parentId,
        isTeamReply: user.role === 'admin' && !!parentId,
        status: 'approved'
      };

      const created = await api.createComment(commentData);
      if (created) {
        setComments(prev => [...prev, created as Comment]);
        if (parentId) {
          setReplyContent('');
          setReplyingTo(null);
        } else {
          setNewComment('');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || user.role !== 'admin') return;
    try {
      await api.deleteComment(id);
      setComments(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  const rootComments = comments.filter(c => !c.parentCommentId);
  const getReplies = (parentId: string) => comments.filter(c => c.parentCommentId === parentId);

  if (loading) return <div className="py-12 text-center text-black/40">Loading comments...</div>;

  return (
    <section className="mt-32 pt-20 border-t border-black/5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-3xl font-serif font-bold flex items-center gap-3">
          <MessageSquare className="text-blue-600" />
          Conversation ({comments.length})
        </h2>
      </div>

      {/* Comment Input / Subscriber Prompt */}
      <div className="mb-16">
        {user ? (
          user.isSubscriber || user.role === 'admin' ? (
            <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
              <div className="relative group">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full p-6 bg-gray-50 rounded-3xl border border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none min-h-[120px] resize-none text-lg"
                  maxLength={1000}
                />
                <div className="absolute bottom-4 right-4 text-xs text-black/20">
                  {newComment.length}/1000
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-4 rounded-2xl">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                  <Send size={18} />
                </button>
              </div>
            </form>
          ) : (
            <div className="p-12 bg-blue-50 rounded-3xl text-center">
              <h3 className="text-xl font-bold mb-4">Join the Conversation</h3>
              <p className="text-black/60 mb-8 max-w-md mx-auto">
                Only subscribers of Parallel Pages can join the conversation. Subscribe to share your thoughts.
              </p>
              <Link
                to="/newsletter"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all"
              >
                Subscribe Now
              </Link>
            </div>
          )
        ) : (
          <div className="p-12 bg-gray-50 rounded-3xl text-center border border-dashed border-black/10">
            <h3 className="text-xl font-bold mb-4">Subscribe to Parallel Pages</h3>
            <p className="text-black/60 mb-8 max-w-md mx-auto">
              Subscribe to join the inner circle, comment on posts, and get exclusive insights.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={login}
                className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-black/80 transition-all w-full sm:w-auto"
              >
                Login to Comment
              </button>
              <Link
                to="/newsletter"
                className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all w-full sm:w-auto"
              >
                Subscribe
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-12">
        <AnimatePresence mode="popLayout">
          {rootComments.length > 0 ? (
            rootComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                replies={getReplies(comment.id)}
                isAdmin={user?.role === 'admin'}
                onDelete={handleDelete}
                onReply={(parentId) => setReplyingTo(parentId)}
                replyingTo={replyingTo}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                onReplySubmit={handleSubmit}
                submitting={submitting}
              />
            ))
          ) : (
            <div className="py-20 text-center text-black/20 italic">
              No comments yet. Be the first to share your thoughts.
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onReply: (id: string | null) => void;
  replyingTo: string | null;
  replyContent: string;
  setReplyContent: (val: string) => void;
  onReplySubmit: (e: React.FormEvent, parentId: string) => void;
  submitting: boolean;
}

function CommentItem({
  comment,
  replies,
  isAdmin,
  onDelete,
  onReply,
  replyingTo,
  replyContent,
  setReplyContent,
  onReplySubmit,
  submitting
}: CommentItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group"
    >
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden shrink-0">
          <img
            src={comment.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorName}`}
            alt={comment.authorName}
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`font-bold ${comment.isTeamReply ? 'text-blue-600' : 'text-black'}`}>
                {comment.authorName}
              </span>
              {comment.isTeamReply && (
                <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded flex items-center gap-1">
                  <Shield size={10} /> Team Parallel Pages
                </span>
              )}
              <span className="text-xs text-black/20">• {formatDate(comment.createdAt)}</span>
            </div>
            {isAdmin && (
              <button
                onClick={() => onDelete(comment.id)}
                className="p-2 text-black/20 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <p className="text-black/70 leading-relaxed mb-4 whitespace-pre-wrap">
            {comment.content}
          </p>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <button
                onClick={() => onReply(replyingTo === comment.id ? null : comment.id)}
                className="text-xs font-bold text-black/40 hover:text-blue-600 flex items-center gap-1 transition-colors"
              >
                <Reply size={14} /> {replyingTo === comment.id ? 'Cancel' : 'Reply'}
              </button>
            )}
          </div>

          {/* Reply Input */}
          {replyingTo === comment.id && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={(e) => onReplySubmit(e, comment.id)}
              className="mt-6 space-y-4"
            >
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none min-h-[80px] resize-none text-sm"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !replyContent.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Replying...' : 'Post Reply'}
                </button>
              </div>
            </motion.form>
          )}

          {/* Nested Replies */}
          {replies.length > 0 && (
            <div className="mt-8 space-y-8 border-l-2 border-black/5 pl-8">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  replies={[]} // Only one level of nesting for simplicity
                  isAdmin={isAdmin}
                  onDelete={onDelete}
                  onReply={onReply}
                  replyingTo={replyingTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  onReplySubmit={onReplySubmit}
                  submitting={submitting}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
