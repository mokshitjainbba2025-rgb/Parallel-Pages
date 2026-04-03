import { SiteSettings } from './types';

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Parallel Pages',
  siteDescription: 'A modern, editorial blogging platform for entrepreneurs, students, and creators.',
  primaryColor: '#000000',
  secondaryColor: '#f3f4f6',
  accentColor: '#2563eb',
  fontSans: 'Inter',
  fontSerif: 'Playfair Display',
  navigation: [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' }
  ],
  socialLinks: {
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com'
  },
  authorName: 'Team Parallel Pages',
  authorBio: 'Parallel Pages is a curated platform for young builders and thinkers. Our team works to bring you the best insights on technology, creativity, and startups.',
  authorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Team Parallel Pages',
  themeMode: 'light'
};
