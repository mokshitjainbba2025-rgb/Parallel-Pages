import { Post, SiteSettings, UserProfile } from '../types';

const API_BASE = '/api';

export const api = {
  // Auth
  async login(credentials: any) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  async logout() {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`);
    if (!res.ok) return null;
    return res.json();
  },

  // Posts
  async getPosts(): Promise<Post[]> {
    const res = await fetch(`${API_BASE}/posts`);
    return res.json();
  },

  async getPost(slug: string): Promise<Post> {
    const res = await fetch(`${API_BASE}/posts/${slug}`);
    if (!res.ok) throw new Error('Post not found');
    return res.json();
  },

  async createPost(post: Partial<Post>) {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    return res.json();
  },

  async updatePost(id: string, post: Partial<Post>) {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    return res.json();
  },

  async deletePost(id: string) {
    await fetch(`${API_BASE}/posts/${id}`, { method: 'DELETE' });
  },

  // Settings
  async getSettings(): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },

  async updateSettings(settings: Partial<SiteSettings>) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  // Newsletter
  async subscribe(email: string) {
    const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },
};
