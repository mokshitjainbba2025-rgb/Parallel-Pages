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
  contributorId?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'published';
  publishedAt: any;
  createdAt: any;
  updatedAt: any;
  tags: string[];
  category: string;
  readingTime: number;
  likesCount: number;
  viewsCount: number;
  commentsCount: number;
  featured?: boolean;
  rejectionReason?: string;
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
  role: 'admin' | 'writer' | 'reader';
  isSubscriber?: boolean;
  createdAt: any;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: any;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorId: string;
  authorAvatar?: string;
  authorRole?: 'admin' | 'writer' | 'reader';
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

export interface AnalyticsEvent {
  id?: string;
  type: 'page_view' | 'session_ping';
  path: string;
  slug?: string;
  referrer: string;
  visitorId: string;
  sessionId: string;
  timestamp: any;
  userAgent: string;
}

export interface AnalyticsMetrics {
  totalPageViews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  bounceRate: number;
  topPosts: { slug: string; title: string; views: number }[];
  trafficSources: { source: string; count: number }[];
}
