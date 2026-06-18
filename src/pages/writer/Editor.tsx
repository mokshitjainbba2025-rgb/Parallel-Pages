import React, { useState, useEffect } from 'react';
import WriterLayout from '../../components/WriterLayout';
import { api } from '../../services/api';
import { useApp } from '../../App';
import { Post } from '../../types';
import { Save, Send, Image as ImageIcon, Link as LinkIcon, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { motion } from 'motion/react';

const CATEGORIES = ['Technology', 'Design', 'Startup', 'Lifestyle', 'Personal Growth', 'Storytelling'];

export default function WriterEditor() {
  const { user } = useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  
  const [post, setPost] = useState<Partial<Post>>({
    title: '',
    content: '',
    excerpt: '',
    category: 'Technology',
    coverImage: '',
    tags: [],
    status: 'draft'
  });

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const data = await api.getPostBySlug(id); // Using slug as ID in early turn but here we need actual ID if it's editing
          // In a real app we'd have a getPostById, but our getPostsByAuthor returns full objects.
          // Let's assume the param is the ID for the admin/writer routes.
          const realPost = await api.getPostsByAuthor(user?.uid || '');
          const found = realPost.find(p => p.id === id);
          if (found) setPost(found);
        } catch (err) {
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchPost();
    }
  }, [id, user]);

  const handleSave = async (submit = false) => {
    if (!post.title || !post.content) {
      alert('Please provide a title and content');
      return;
    }

    setLoading(true);
    try {
      const slug = post.slug || post.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const data = {
        ...post,
        slug,
        authorId: user?.uid,
        authorName: user?.displayName,
        authorAvatar: user?.photoURL,
        contributorId: user?.uid,
        status: submit ? 'submitted' : (post.status || 'draft')
      };

      if (id) {
        await api.updatePost(id, data);
      } else {
        await api.createPost(data);
      }
      
      navigate('/writer/posts');
    } catch (err) {
      console.error(err);
      alert('Failed to save story');
    } finally {
      setLoading(false);
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

  if (fetching) return <WriterLayout><div className="flex items-center justify-center h-screen">Loading editor...</div></WriterLayout>;

  return (
    <WriterLayout>
      <div className="max-w-4xl mx-auto pb-20">
        <div className="flex justify-between items-center mb-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors font-medium">
            <ArrowLeft size={20} /> Back
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleSave(false)}
              disabled={loading}
              className="px-6 py-3 rounded-2xl font-bold border border-gray-200 hover:bg-gray-50 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Draft
            </button>
            <button 
              onClick={() => handleSave(true)}
              disabled={loading}
              className="px-6 py-3 rounded-2xl font-bold bg-black text-white hover:bg-blue-600 flex items-center gap-2 transition-all shadow-lg shadow-black/10 disabled:opacity-50"
            >
              <Send size={18} />
              Submit Review
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Cover Image */}
          <div className="relative group rounded-[2.5rem] overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 h-64 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 transition-colors">
            {post.coverImage ? (
              <>
                <img src={post.coverImage} className="w-full h-full object-cover" alt="Cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => setPost({ ...post, coverImage: '' })} className="bg-white p-3 rounded-full text-red-500 shadow-xl"><Loader2 size={24} className="rotate-45" /></button>
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-300 mx-auto mb-4">
                  <ImageIcon size={32} />
                </div>
                <input 
                  type="text" 
                  placeholder="Paste cover image URL..." 
                  className="bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-center text-sm w-64"
                  onChange={(e) => setPost({ ...post, coverImage: e.target.value })}
                />
                <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-widest">Recommended: 1200 x 630px</p>
              </div>
            )}
          </div>

          {/* Title */}
          <textarea
            placeholder="Your Story Title..."
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            className="w-full text-5xl font-serif font-bold bg-transparent border-none outline-none resize-none placeholder:text-gray-200"
            rows={2}
          />

          <div className="flex flex-wrap gap-4 items-center">
            <select 
              value={post.category} 
              onChange={(e) => setPost({ ...post, category: e.target.value })}
              className="bg-gray-50 px-4 py-2 rounded-xl text-sm font-bold outline-none border border-gray-100"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="h-4 w-px bg-gray-200"></div>
            <input 
              type="text" 
              placeholder="Excerpt (short summary)..."
              value={post.excerpt}
              onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
              className="flex-1 bg-transparent border-none outline-none text-gray-500 font-medium italic"
            />
          </div>

          {/* Editor */}
          <div className="min-h-[400px]">
            <ReactQuill 
              theme="snow"
              value={post.content}
              onChange={(content) => setPost({ ...post, content })}
              modules={modules}
              className="h-full font-serif text-lg leading-relaxed"
              placeholder="Tell your story..."
            />
          </div>
        </div>
      </div>
      
      <style>{`
        .ql-container {
          border: none !important;
          font-family: 'Inter', serif !important;
          font-size: 1.125rem !important;
        }
        .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #f3f4f6 !important;
          position: sticky;
          top: 80px;
          z-index: 20;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          padding: 12px 0 !important;
        }
        .ql-editor {
          padding: 40px 0 !important;
          min-height: 500px;
        }
        .ql-editor.ql-blank::before {
          color: #e5e7eb !important;
          font-style: italic !important;
          left: 0 !important;
        }
      `}</style>
    </WriterLayout>
  );
}
