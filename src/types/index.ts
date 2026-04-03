export interface Contributor {
  id: string;
  name: string;
  bio: string;
  image: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

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
  contributorId?: string; // New field
  status: 'draft' | 'review' | 'published'; // Updated status
  publishedAt: any; // Firebase Timestamp or ISO string
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
  authorName: string;
  authorBio: string;
  authorImage: string;
  themeMode: 'light' | 'dark' | 'system';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  role: 'admin' | 'author';
  isSubscriber?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorId: string;
  authorAvatar?: string;
  content: string;
  createdAt: any;
  status: 'pending' | 'approved' | 'rejected';
  parentCommentId?: string;
  isTeamReply?: boolean;
}

export interface NewsletterSubscriber {
  email: string;
  subscribedAt: any;
}
