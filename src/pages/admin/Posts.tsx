import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { api } from '../../services/api';
import { Post } from '../../types';
import { useApp } from '../../App';
import { Plus, Search, MoreVertical, Edit2, Trash2, ExternalLink, X, Save, Image as ImageIcon, Tag, Layout as LayoutIcon } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const { settings, user } = useApp();
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);

  const editId = searchParams.get('edit');
  const isNew = searchParams.get('new') === 'true';

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (editId) {
      const post = posts.find(p => p.id === editId);
      if (post) {
        setEditingPost(post);
        setIsEditorOpen(true);
      }
    } else if (isNew) {
      setEditingPost({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        coverImage: 'https://picsum.photos/seed/new/1200/630',
        category: 'General',
        tags: [],
        status: 'draft',
        seo: { title: '', description: '' }
      });
      setIsEditorOpen(true);
    } else {
      setIsEditorOpen(false);
      setEditingPost(null);
    }
  }, [editId, isNew, posts]);

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

  const handleSave = async () => {
    if (!editingPost || !user) return;
    try {
      if (editingPost.id) {
        await api.updatePost(editingPost.id, editingPost);
      } else {
        await api.createPost({
          ...editingPost,
          authorName: user.displayName || settings?.authorName || 'Anonymous',
          authorId: user.uid,
          authorAvatar: user.photoURL || undefined,
          readingTime: Math.ceil((editingPost.content?.split(' ').length || 0) / 200)
        });
      }
      await fetchPosts();
      setSearchParams({});
    } catch (err) {
      console.error('Failed to save post', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.deletePost(id);
        fetchPosts();
      } catch (err) {
        console.error('Failed to delete post', err);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search posts..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <button
          onClick={() => setSearchParams({ new: 'true' })}
          className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all"
        >
          <Plus size={20} /> New Post
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Post</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Category</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Date</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                      <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="font-bold text-sm line-clamp-1">{post.title}</p>
                      <p className="text-xs text-gray-400 mt-1">/{post.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    post.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{post.category}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(post.publishedAt)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setSearchParams({ edit: post.id })}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-gray-400 hover:text-black transition-colors"
                    >
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditorOpen && editingPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Editor Header */}
              <div className="h-20 border-b border-gray-100 px-8 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSearchParams({})} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                  <h2 className="font-bold">{editingPost.id ? 'Edit Post' : 'New Post'}</h2>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={editingPost.status}
                    onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as any })}
                    className="bg-gray-100 px-4 py-2 rounded-xl text-sm font-bold focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all"
                  >
                    <Save size={18} /> Save Changes
                  </button>
                </div>
              </div>

              {/* Editor Body */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-8">
                    <input
                      type="text"
                      placeholder="Post Title"
                      value={editingPost.title}
                      onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                      className="w-full text-4xl font-serif font-bold border-none focus:ring-0 placeholder:text-gray-200"
                    />
                    <textarea
                      placeholder="Write your story here... (Markdown supported)"
                      value={editingPost.content}
                      onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                      className="w-full h-[500px] text-lg leading-relaxed border-none focus:ring-0 placeholder:text-gray-200 resize-none"
                    />
                  </div>

                  {/* Sidebar Settings */}
                  <div className="space-y-8">
                    <div className="bg-gray-50 p-6 rounded-2xl space-y-6">
                      <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <LayoutIcon size={16} /> Post Settings
                      </h3>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Slug</label>
                        <input
                          type="text"
                          value={editingPost.slug}
                          onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Category</label>
                        <input
                          type="text"
                          value={editingPost.category}
                          onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Excerpt</label>
                        <textarea
                          value={editingPost.excerpt}
                          onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 h-24 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Cover Image URL</label>
                        <div className="relative">
                          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="text"
                            value={editingPost.coverImage}
                            onChange={(e) => setEditingPost({ ...editingPost, coverImage: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        {editingPost.coverImage && (
                          <img src={editingPost.coverImage} className="mt-4 rounded-xl aspect-video object-cover" referrerPolicy="no-referrer" />
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Tags (comma separated)</label>
                        <div className="relative">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="text"
                            value={editingPost.tags?.join(', ')}
                            onChange={(e) => setEditingPost({ ...editingPost, tags: e.target.value.split(',').map(t => t.trim()) })}
                            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-2xl">
                      <h3 className="font-bold text-sm text-blue-600 mb-4">SEO Preview</h3>
                      <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                        <p className="text-blue-600 text-sm font-medium truncate">{editingPost.title || 'Untitled Post'}</p>
                        <p className="text-green-700 text-xs mt-1">parallelpages.com/blog/{editingPost.slug || '...'}</p>
                        <p className="text-gray-500 text-xs mt-2 line-clamp-2">{editingPost.excerpt || 'No description provided.'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
