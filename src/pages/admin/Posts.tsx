import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { api } from '../../services/api';
import { Post, Contributor } from '../../types';
import { useApp } from '../../App';
import { Plus, Search, MoreVertical, Edit2, Trash2, ExternalLink, X, Save, Image as ImageIcon, Tag, Layout as LayoutIcon, User as UserIcon, Check, Star } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { useSearchParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { motion, AnimatePresence } from 'motion/react';

const sanitizeContentText = (content: string): string => {
  if (!content) return '';
  return content
    .replace(/\u200B/g, '') // Zero-width space
    .replace(/\u00AD/g, '') // Soft hyphen
    .replace(/\u2028/g, '') // Line separator
    .replace(/\u2029/g, '') // Paragraph separator
    .replace(/\uFEFF/g, '') // Byte Order Mark
    .replace(/&shy;/g, '')   // Soft hyphen entities
    .replace(/&#173;/g, '')
    .replace(/&#8203;/g, '');
};

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const { settings, user } = useApp();
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);

  const editId = searchParams.get('edit');
  const isNew = searchParams.get('new') === 'true';

  useEffect(() => {
    fetchPosts();
    fetchContributors();
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
        contributorId: '',
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

  const fetchContributors = async () => {
    try {
      const data = await api.getContributors();
      setContributors(data);
    } catch (err) {
      console.error(err);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image', 'code-block'],
      ['clean']
    ],
  };

  const handleSave = async () => {
    if (!editingPost || !user) return;
    try {
      setLoading(true);
      const sanitizedPost = {
        ...editingPost,
        content: sanitizeContentText(editingPost.content || '')
      };
      if (editingPost.id) {
        await api.updatePost(editingPost.id, sanitizedPost);
        alert('Post updated successfully!');
      } else {
        await api.createPost({
          ...sanitizedPost,
          authorName: user.displayName || settings?.authorName || 'Anonymous',
          authorId: user.uid,
          authorAvatar: user.photoURL || undefined,
          readingTime: Math.ceil((sanitizedPost.content?.split(' ').length || 0) / 200)
        });
        alert('Post created successfully!');
      }
      await fetchPosts();
      setSearchParams({});
    } catch (err) {
      console.error('Failed to save post', err);
      alert('Failed to save post. Please check your credentials or network.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: Post['status']) => {
    try {
      let reason = '';
      if (status === 'rejected') {
        reason = prompt('Reason for rejection:') || '';
        if (!reason) return;
      }
      
      setLoading(true);
      if (status === 'rejected') {
        await api.updatePost(id, { status, rejectionReason: reason });
      } else {
        await api.updatePostStatus(id, status);
      }
      await fetchPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (post: Post) => {
    try {
      await api.updatePost(post.id, { featured: !post.featured });
      fetchPosts();
    } catch (err) {
      console.error(err);
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
            onChange={(e) => {
              const term = e.target.value.toLowerCase();
              if (!term) {
                fetchPosts();
                return;
              }
              const filtered = posts.filter(p => 
                p.title.toLowerCase().includes(term) || 
                p.slug.toLowerCase().includes(term)
              );
              setPosts(filtered);
            }}
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
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Contributor</th>
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
                      {post.coverImage ? (
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[10px] text-black/20 font-bold uppercase">No image</div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm line-clamp-1">{post.title}</p>
                      <p className="text-xs text-gray-400 mt-1">/{post.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    post.status === 'published' ? 'bg-green-50 text-green-600' : 
                    post.status === 'submitted' ? 'bg-blue-50 text-blue-600' :
                    post.status === 'rejected' ? 'bg-red-50 text-red-600' :
                    'bg-orange-50 text-orange-600'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{post.authorName || 'Anonymous'}</span>
                    <span className="text-[10px] text-gray-400">Writer ID: {post.authorId?.slice(0, 8)}...</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(post.createdAt)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {post.status === 'submitted' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(post.id, 'published')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Approve & Publish"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(post.id, 'rejected')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Reject"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleToggleFeatured(post)}
                      className={`p-2 rounded-lg transition-colors ${post.featured ? 'text-amber-500 bg-amber-50' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'}`}
                      title={post.featured ? "Unfeature" : "Feature"}
                    >
                      <Star className="w-5 h-5" fill={post.featured ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={() => setSearchParams({ edit: post.id })}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
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
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 size={18} />
                    </button>
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
              {/* Editor styles */}
              <style>{`
                .ql-container {
                  border: none !important;
                  font-family: inherit !important;
                  font-size: 1.125rem !important;
                }
                .ql-toolbar {
                  border: none !important;
                  border-bottom: 1px solid #f3f4f6 !important;
                  background: white;
                  padding: 12px 0 !important;
                  margin-bottom: 20px;
                }
                .ql-editor {
                  padding: 0 !important;
                  min-height: 400px;
                }
                .ql-editor.ql-blank::before {
                  color: #e5e7eb !important;
                  font-style: italic !important;
                  left: 0 !important;
                }
              `}</style>

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
                    <option value="review">Review</option>
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
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        const updates: any = { title: newTitle };
                        // Only auto-generate slug for new posts if it wasn't manually edited
                        if (isNew) {
                          updates.slug = newTitle.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                        }
                        setEditingPost({ ...editingPost, ...updates });
                      }}
                      className="w-full text-4xl font-serif font-bold border-none focus:ring-0 placeholder:text-gray-200"
                    />
                    <div className="min-h-[400px]">
                      <label className="block text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                        <Edit2 size={12} /> Content
                      </label>
                      <ReactQuill 
                        theme="snow"
                        value={editingPost.content}
                        onChange={(content) => setEditingPost({ ...editingPost, content })}
                        modules={modules}
                        className="h-full font-serif text-lg leading-relaxed"
                        placeholder="Tell your story..."
                      />
                    </div>
                  </div>

                  {/* Sidebar Settings */}
                  <div className="space-y-8">
                    <div className="bg-gray-50 p-6 rounded-2xl space-y-6">
                      <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <LayoutIcon size={16} /> Post Settings
                      </h3>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase flex items-center gap-1">
                          <UserIcon size={12} /> Contributor
                        </label>
                        <select
                          value={editingPost.contributorId || ''}
                          onChange={(e) => setEditingPost({ ...editingPost, contributorId: e.target.value })}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                        >
                          <option value="">None (Personal Post)</option>
                          {contributors.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

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
                        {editingPost.coverImage ? (
                          <img src={editingPost.coverImage} className="mt-4 rounded-xl aspect-video object-cover" referrerPolicy="no-referrer" />
                        ) : null}
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
