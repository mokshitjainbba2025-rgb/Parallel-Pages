import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { AnalyticsEvent, AnalyticsMetrics } from '../types';

const VISITOR_ID_KEY = 'pp_visitor_id';
const SESSION_ID_KEY = 'pp_session_id';

class AnalyticsService {
  private visitorId: string;
  private sessionId: string;

  constructor() {
    this.visitorId = this.getOrCreateVisitorId();
    this.sessionId = this.createNewSessionId();
  }

  private getOrCreateVisitorId(): string {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  }

  private createNewSessionId(): string {
    const id = Math.random().toString(36).substring(2, 11);
    sessionStorage.setItem(SESSION_ID_KEY, id);
    return id;
  }

  async trackPageView(path: string, slug?: string) {
    try {
      const event: any = {
        type: 'page_view',
        path: path || '/',
        referrer: document.referrer || 'direct',
        visitorId: this.visitorId,
        sessionId: this.sessionId,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent
      };

      if (slug) {
        event.slug = slug;
      }

      await addDoc(collection(db, 'analytics'), event);
    } catch (error) {
      console.error('Analytics: Failed to track page view.', {
        error,
        auth: auth.currentUser?.uid || 'anonymous',
        path: path,
        slug: slug
      });
    }
  }

  async trackSessionPing() {
    try {
      const event: any = {
        type: 'session_ping',
        path: window.location.pathname,
        visitorId: this.visitorId,
        sessionId: this.sessionId,
        timestamp: serverTimestamp(),
        referrer: 'session_ping',
        userAgent: navigator.userAgent
      };
      await addDoc(collection(db, 'analytics'), event);
    } catch (error) {
       console.error('Analytics: Failed to track session ping.', {
        error,
        auth: auth.currentUser?.uid || 'anonymous',
        path: window.location.pathname
      });
    }
  }

  async getMetrics(days = 30): Promise<AnalyticsMetrics> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startTimestamp = Timestamp.fromDate(startDate);

    const q = query(
      collection(db, 'analytics'),
      where('timestamp', '>=', startTimestamp),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnalyticsEvent));

    const pageViews = events.filter(e => e.type === 'page_view');
    const pings = events.filter(e => e.type === 'session_ping');

    const sessions = new Set(pageViews.map(e => e.sessionId));
    const visitors = new Set(pageViews.map(e => e.visitorId));

    // Calculate session durations
    const sessionMap = new Map<string, { start: number; end: number }>();
    events.forEach(e => {
      const ts = e.timestamp.toMillis();
      const s = sessionMap.get(e.sessionId) || { start: ts, end: ts };
      s.start = Math.min(s.start, ts);
      s.end = Math.max(s.end, ts);
      sessionMap.set(e.sessionId, s);
    });

    let totalDuration = 0;
    sessionMap.forEach(s => {
      totalDuration += (s.end - s.start);
    });

    const avgDuration = sessions.size > 0 ? (totalDuration / sessions.size) / 1000 : 0; // in seconds

    // Calculate Bounce Rate (sessions with only 1 page view and no pings/duration < 5s)
    const sessionViewCount = new Map<string, number>();
    pageViews.forEach(e => {
      sessionViewCount.set(e.sessionId, (sessionViewCount.get(e.sessionId) || 0) + 1);
    });

    let bounces = 0;
    sessionMap.forEach((s, sid) => {
      const views = sessionViewCount.get(sid) || 0;
      if (views === 1 && (s.end - s.start) < 5000) {
        bounces++;
      }
    });

    const bounceRate = sessions.size > 0 ? (bounces / sessions.size) * 100 : 0;

    // Traffic Sources
    const sourceCounts = new Map<string, number>();
    pageViews.forEach(e => {
      let source = e.referrer;
      if (source === 'direct') {
        // stay direct
      } else {
        try {
          source = new URL(source).hostname;
        } catch {
          source = 'other';
        }
      }
      sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
    });

    const trafficSources = Array.from(sourceCounts.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    // Top Posts
    const postViewCounts = new Map<string, number>();
    pageViews.forEach(e => {
      if (e.slug) {
        postViewCounts.set(e.slug, (postViewCounts.get(e.slug) || 0) + 1);
      }
    });

    const topPostsList = Array.from(postViewCounts.entries())
      .map(([slug, views]) => ({ slug, views, title: slug })) // Title will need updating from posts list
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    return {
      totalPageViews: pageViews.length,
      uniqueVisitors: visitors.size,
      avgSessionDuration: avgDuration,
      bounceRate,
      trafficSources,
      topPosts: topPostsList
    };
  }
}

export const analytics = new AnalyticsService();
