import React, { useEffect, useState } from 'react';
import WriterLayout from '../../components/WriterLayout';
import { api } from '../../services/api';
import { useApp } from '../../App';
import { Contributor } from '../../types';
import { Save, User, Globe, Twitter, Linkedin, Github, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function WriterProfile() {
  const { user } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const list = await api.getContributors();
      const found = list.find((c) => c.id === user.uid);

      if (found) {
        setId(found.id);
        setName(found.name || user.displayName || '');
        setBio(found.bio || user.bio || '');
        setImage(found.image || '');
        setTwitter(found.social?.twitter || '');
        setLinkedin(found.social?.linkedin || '');
        setGithub(found.social?.github || '');
        setWebsite(found.social?.website || '');
      } else {
        // Lazily create contributor record if not exists
        const initials = user.displayName || 'Writer';
        const initialImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0D0D0D&color=fff&size=512&bold=true`;
        
        const newContr: Contributor = {
          id: user.uid,
          name: user.displayName || 'Writer',
          bio: user.bio || '',
          image: initialImage,
          social: {
            twitter: '',
            linkedin: '',
            github: '',
            website: ''
          }
        };
        await api.createContributor(newContr);
        
        setId(newContr.id);
        setName(newContr.name);
        setBio(newContr.bio);
        setImage(newContr.image);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToInitials = () => {
    const contributorName = name || user?.displayName || 'Writer';
    const initialImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(contributorName)}&background=0D0D0D&color=fff&size=512&bold=true`;
    setImage(initialImage);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!bio.trim()) {
      setError('Bio is required');
      return;
    }

    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const updatedProfile: Partial<Contributor> = {
        name,
        bio,
        image,
        social: {
          twitter,
          linkedin,
          github,
          website
        }
      };

      await api.updateContributor(user?.uid || id, updatedProfile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error(err);
      setError('Failed to update contributor profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <WriterLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <span className="ml-3 text-gray-500 font-medium">Loading profile details...</span>
        </div>
      </WriterLayout>
    );
  }

  return (
    <WriterLayout>
      <div className="max-w-4xl mx-auto pb-20">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Contributor Profile</h1>
          <p className="text-gray-500 mt-1">This information is displayed under your published stories and on the Voices page.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Error</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-sm flex items-start gap-3">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Success</p>
              <p className="text-xs mt-0.5">Contributor profile details updated successfully!</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar and bio overview column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Profile Photo</label>
              
              <div className="relative group w-32 h-32 mb-4">
                <img
                  src={image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Writer')}&background=0D0D0D&color=fff&size=512&bold=true`}
                  alt={name}
                  className="w-full h-full rounded-3xl object-cover border-2 border-gray-100 group-hover:opacity-90 transition-opacity"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-2 w-full">
                <button
                  type="button"
                  onClick={handleResetToInitials}
                  className="w-full px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-gray-600"
                >
                  <RefreshCw size={12} />
                  Reset to Initials Photo
                </button>
              </div>

              <div className="border-t border-gray-100 w-full mt-6 pt-4 text-center">
                <h3 className="font-bold text-gray-900">{name || 'Your Name'}</h3>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mt-1">Writer Account</p>
              </div>
            </div>
          </div>

          {/* Edit form fields column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your public display name"
                  required
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all placeholder:text-gray-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">My Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a warm, creative bio that introduces you to our readers..."
                  required
                  rows={4}
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all placeholder:text-gray-300 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Custom Image URL (Optional)</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/your-image.jpg"
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all placeholder:text-gray-300 text-sm text-gray-600"
                />
                <p className="text-[10px] text-gray-400 mt-1.5 leading-normal">
                  Provide a web URL to any custom headshot or photo. If empty, the name first initials avatar is displayed automatically.
                </p>
              </div>

              <div className="pt-6 border-t border-gray-50">
                <h3 className="font-bold text-gray-900 text-sm mb-4">Connect Social Profiles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Twitter size={12} className="text-gray-400" /> Twitter URL
                    </label>
                    <input
                      type="url"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="https://twitter.com/username"
                      className="w-full px-5 py-3.5 bg-gray-50 rounded-xl border-2 border-transparent focus:border-black outline-none transition-all text-xs text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Linkedin size={12} className="text-gray-400" /> LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-5 py-3.5 bg-gray-50 rounded-xl border-2 border-transparent focus:border-black outline-none transition-all text-xs text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Github size={12} className="text-gray-400" /> GitHub URL
                    </label>
                    <input
                      type="url"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full px-5 py-3.5 bg-gray-50 rounded-xl border-2 border-transparent focus:border-black outline-none transition-all text-xs text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Globe size={12} className="text-gray-400" /> Website URL
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://mywebsite.com"
                      className="w-full px-5 py-3.5 bg-gray-50 rounded-xl border-2 border-transparent focus:border-black outline-none transition-all text-xs text-gray-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-black/10 disabled:opacity-50 min-w-[160px] justify-center"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Details
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </form>
      </div>
    </WriterLayout>
  );
}
