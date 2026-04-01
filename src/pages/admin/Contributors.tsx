import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { api } from '../../services/api';
import { Contributor } from '../../types';
import { Plus, Search, Edit2, Trash2, X, Save, User as UserIcon, Mail, Globe, Twitter, Linkedin, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminContributors() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingContributor, setEditingContributor] = useState<Partial<Contributor> | null>(null);

  useEffect(() => {
    fetchContributors();
  }, []);

  const fetchContributors = async () => {
    try {
      const data = await api.getContributors();
      setContributors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingContributor) return;
    try {
      if (editingContributor.id) {
        await api.updateContributor(editingContributor.id, editingContributor);
      } else {
        await api.createContributor(editingContributor as Omit<Contributor, 'id'>);
      }
      await fetchContributors();
      setIsEditorOpen(false);
    } catch (err) {
      console.error('Failed to save contributor', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteContributor(id);
      fetchContributors();
    } catch (err) {
      console.error('Failed to delete contributor', err);
    }
  };

  const openEditor = (contributor?: Contributor) => {
    setEditingContributor(contributor || {
      name: '',
      bio: '',
      image: 'https://picsum.photos/seed/avatar/200/200',
      social: {}
    });
    setIsEditorOpen(true);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search contributors..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <button
          onClick={() => openEditor()}
          className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all"
        >
          <Plus size={20} /> Add Contributor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contributors.map((contributor) => (
          <div key={contributor.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <img 
                  src={contributor.image} 
                  alt={contributor.name} 
                  className="w-16 h-16 rounded-2xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="font-bold text-lg">{contributor.name}</h3>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Contributor</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditor(contributor)} className="p-2 text-gray-400 hover:text-blue-600">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(contributor.id)} className="p-2 text-gray-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">
              {contributor.bio}
            </p>
            <div className="flex gap-3">
              {contributor.social?.twitter && <Twitter size={14} className="text-gray-400" />}
              {contributor.social?.linkedin && <Linkedin size={14} className="text-gray-400" />}
              {contributor.social?.github && <Github size={14} className="text-gray-400" />}
              {contributor.social?.website && <Globe size={14} className="text-gray-400" />}
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditorOpen && editingContributor && (
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
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="h-20 border-b border-gray-100 px-8 flex items-center justify-between bg-white shrink-0">
                <h2 className="font-bold">{editingContributor.id ? 'Edit Contributor' : 'New Contributor'}</h2>
                <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Full Name</label>
                    <input
                      type="text"
                      value={editingContributor.name}
                      onChange={(e) => setEditingContributor({ ...editingContributor, name: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Bio</label>
                    <textarea
                      value={editingContributor.bio}
                      onChange={(e) => setEditingContributor({ ...editingContributor, bio: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 h-32 resize-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Profile Image URL</label>
                    <input
                      type="text"
                      value={editingContributor.image}
                      onChange={(e) => setEditingContributor({ ...editingContributor, image: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="col-span-2 pt-4 border-t border-gray-100">
                    <h3 className="font-bold text-sm mb-4">Social Links</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Twitter</label>
                        <input
                          type="text"
                          value={editingContributor.social?.twitter || ''}
                          onChange={(e) => setEditingContributor({ 
                            ...editingContributor, 
                            social: { ...editingContributor.social, twitter: e.target.value } 
                          })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">LinkedIn</label>
                        <input
                          type="text"
                          value={editingContributor.social?.linkedin || ''}
                          onChange={(e) => setEditingContributor({ 
                            ...editingContributor, 
                            social: { ...editingContributor.social, linkedin: e.target.value } 
                          })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">GitHub</label>
                        <input
                          type="text"
                          value={editingContributor.social?.github || ''}
                          onChange={(e) => setEditingContributor({ 
                            ...editingContributor, 
                            social: { ...editingContributor.social, github: e.target.value } 
                          })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Website</label>
                        <input
                          type="text"
                          value={editingContributor.social?.website || ''}
                          onChange={(e) => setEditingContributor({ 
                            ...editingContributor, 
                            social: { ...editingContributor.social, website: e.target.value } 
                          })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all"
                >
                  <Save size={18} /> Save Contributor
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
