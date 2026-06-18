import React, { createContext, useContext, useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Post, SiteSettings, UserProfile } from './types';
import { api } from './services/api';
import { DEFAULT_SETTINGS } from './constants';

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsedError = JSON.parse(this.state.error?.message || "{}");
        if (parsedError.error) {
          errorMessage = `Firestore Error: ${parsedError.error} during ${parsedError.operationType} on ${parsedError.path}`;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Application Error</h1>
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Contexts
interface AppContextType {
  settings: SiteSettings;
  user: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// Components
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import Blog from './pages/Blog';
import SinglePost from './pages/SinglePost';
import About from './pages/About';
import Contact from './pages/Contact';
import Newsletter from './pages/Newsletter';
import Voices from './pages/Voices';
import AdminDashboard from './pages/admin/Dashboard';
import AdminPosts from './pages/admin/Posts';
import AdminContributors from './pages/admin/Contributors';
import AdminSettings from './pages/admin/Settings';
import AdminAnalytics from './pages/admin/Analytics';
import AdminSubscribers from './pages/admin/Subscribers';
import AdminUsers from './pages/admin/Users';
import AdminComments from './pages/admin/Comments';
import WriterDashboard from './pages/writer/Dashboard';
import WriterPosts from './pages/writer/Posts';
import WriterEditor from './pages/writer/Editor';
import WriterProfile from './pages/writer/Profile';
import Login from './pages/Login';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ScrollToTop from './components/ScrollToTop';
import FloatingCTA from './components/FloatingCTA';
import WhatsAppButton from './components/WhatsAppButton';
import { useAnalytics } from './hooks/useAnalytics';

const ProtectedRoute = ({ children, requireAdmin = false, requireWriter = false }: { children: React.ReactNode, requireAdmin?: boolean, requireWriter?: boolean }) => {
  const { user, loading } = useApp();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/" />;
  if (requireWriter && user.role !== 'writer' && user.role !== 'admin') return <Navigate to="/" />;
  
  return <>{children}</>;
};

function AnalyticsTracker() {
  useAnalytics();
  return null;
}

export default function App() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  const refreshSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to fetch settings', err);
    }
  };

  const refreshUser = async () => {
    if (user?.uid) {
      const profile = await api.getUserProfile(user.uid);
      setUser(profile);
    }
  };

  useEffect(() => {
    const unsubscribe = api.onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await api.getUserProfile(firebaseUser.uid);
        setUser(profile);
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });

    const fetchInitialSettings = async () => {
      try {
        const settingsData = await api.getSettings();
        setSettings(settingsData);
      } catch (err) {
        console.error('Failed to fetch settings', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialSettings();
    return () => unsubscribe();
  }, []);

  const login = async () => {
    const result = await api.loginWithGoogle();
    if (result) {
      setUser(result.profile);
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  if (loading || !authReady) return <div className="flex items-center justify-center h-screen">Initializing Parallel Pages...</div>;

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <AppContext.Provider value={{ settings, user, loading, login, logout, refreshSettings, refreshUser }}>
          <Router>
            <ScrollToTop />
            <AnalyticsTracker />
            <FloatingCTA />
            <WhatsAppButton />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<SinglePost />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/voices" element={<Voices />} />
              <Route path="/newsletter" element={<Newsletter />} />
              <Route path="/login" element={<Login />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />

              {/* Writer Routes */}
              <Route path="/writer" element={<ProtectedRoute requireWriter><WriterDashboard /></ProtectedRoute>} />
              <Route path="/writer/posts" element={<ProtectedRoute requireWriter><WriterPosts /></ProtectedRoute>} />
              <Route path="/writer/new" element={<ProtectedRoute requireWriter><WriterEditor /></ProtectedRoute>} />
              <Route path="/writer/edit/:id" element={<ProtectedRoute requireWriter><WriterEditor /></ProtectedRoute>} />
              <Route path="/writer/profile" element={<ProtectedRoute requireWriter><WriterProfile /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute requireAdmin><AdminAnalytics /></ProtectedRoute>} />
              <Route path="/admin/subscribers" element={<ProtectedRoute requireAdmin><AdminSubscribers /></ProtectedRoute>} />
              <Route path="/admin/posts" element={<ProtectedRoute requireAdmin><AdminPosts /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/comments" element={<ProtectedRoute requireAdmin><AdminComments /></ProtectedRoute>} />
              <Route path="/admin/contributors" element={<ProtectedRoute requireAdmin><AdminContributors /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>} />
            </Routes>
          </Router>
        </AppContext.Provider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
