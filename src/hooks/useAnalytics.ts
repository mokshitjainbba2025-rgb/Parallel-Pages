import { useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { analytics } from '../services/analytics';
import { useApp } from '../App';

export function useAnalytics() {
  const location = useLocation();
  const { slug } = useParams();
  const { user } = useApp();
  const lastPath = useRef('');

  useEffect(() => {
    // Only track if not an admin/author to avoid skewing data
    // However, for testing it might be useful. Let's exclude admins if we have a real user
    if (user?.role === 'admin') return;

    if (lastPath.current !== location.pathname) {
      analytics.trackPageView(location.pathname, slug);
      lastPath.current = location.pathname;
    }
  }, [location.pathname, slug, user]);

  useEffect(() => {
    if (user?.role === 'admin') return;

    const interval = setInterval(() => {
      // Send a ping every 30 seconds to track session duration
      analytics.trackSessionPing();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);
}
