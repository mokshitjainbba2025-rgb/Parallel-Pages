import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { api } from '../../services/api';
import { SiteSettings } from '../../types';
import { useApp } from '../../App';
import { Save, Globe, Palette, Type, Share2, Layout as LayoutIcon } from 'lucide-react';
import { motion } from 'motion/react';

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Parallel Pages',
  siteDescription: 'A blog about building and storytelling',
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  accentColor: '#2563eb',
  fontSans: 'Inter',
  fontSerif: 'Playfair Display',
  navigation: [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' }
  ],
  socialLinks: {
    twitter: '',
    linkedin: '',
    instagram: '',
    youtube: ''
  },
  authorName: 'Mokshit Jain',
  authorBio: 'Builder and storyteller.',
  authorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mokshit',
  themeMode: 'light'
};

export default function AdminSettings() {
  const { settings, refreshSettings } = useApp();
  const [formData, setFormData] = useState<SiteSettings>(settings || DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateSettings(formData);
      await refreshSettings();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update settings', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        {/* General Settings */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <Globe className="text-blue-600" size={24} /> General Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Site Name</label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Site Description</label>
              <input
                type="text"
                value={formData.siteDescription}
                onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <Palette className="text-purple-600" size={24} /> Appearance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Primary Color</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-12 h-12 rounded-xl border-none cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Accent Color</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-12 h-12 rounded-xl border-none cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Theme Mode</label>
              <select
                value={formData.themeMode}
                onChange={(e) => setFormData({ ...formData, themeMode: e.target.value as any })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <Type className="text-orange-600" size={24} /> Typography
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Sans Font (UI)</label>
              <input
                type="text"
                value={formData.fontSans}
                onChange={(e) => setFormData({ ...formData, fontSans: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Serif Font (Headings)</label>
              <input
                type="text"
                value={formData.fontSerif}
                onChange={(e) => setFormData({ ...formData, fontSerif: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Author Profile */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <LayoutIcon className="text-pink-600" size={24} /> Author Profile
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Author Name</label>
                <input
                  type="text"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Author Profile Image URL</label>
                <input
                  type="text"
                  value={formData.authorImage}
                  onChange={(e) => setFormData({ ...formData, authorImage: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Author Bio</label>
              <textarea
                value={formData.authorBio}
                onChange={(e) => setFormData({ ...formData, authorBio: e.target.value })}
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <Share2 className="text-green-600" size={24} /> Social Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.keys(formData.socialLinks).map((key) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-bold text-gray-700 capitalize">{key}</label>
                <input
                  type="text"
                  value={(formData.socialLinks as any)[key]}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, [key]: e.target.value }
                  })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-8">
          <p className="text-sm text-gray-400 italic">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <div className="flex items-center gap-4">
            {success && (
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-green-600 font-bold text-sm"
              >
                Settings saved!
              </motion.span>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-50"
            >
              <Save size={20} /> {loading ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
