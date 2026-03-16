export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  status: 'draft' | 'published';
  publishedAt: any; // Firebase Timestamp
  createdAt: any;
  updatedAt: any;
  tags: string[];
  category: string;
  readingTime: number;
  seo: {
    title: string;
    description: string;
    ogImage?: string;
  };
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontSans: string;
  fontSerif: string;
  logoUrl?: string;
  navigation: { label: string; href: string }[];
  socialLinks: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  themeMode: 'light' | 'dark' | 'system';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  role: 'admin' | 'author';
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorId?: string;
  content: string;
  createdAt: any;
}

export interface NewsletterSubscriber {
  email: string;
  subscribedAt: any;
}
