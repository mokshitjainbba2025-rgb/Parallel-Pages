import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { Menu, X, Instagram, Linkedin, Twitter, Youtube, UserCircle, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import AuthModal from './auth/AuthModal';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { settings, user, logout } = useApp();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    if (user?.role === 'admin') navigate('/admin');
    else if (user?.role === 'writer') navigate('/writer');
    else navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-blue-100 selection:text-blue-900">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-serif font-bold tracking-tight">
                {settings.siteName}
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {settings.navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-blue-600",
                    location.pathname === item.href ? "text-blue-600" : "text-black/60"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              
              {user ? (
                <div className="flex items-center gap-4">
                  {(user.role === 'admin' || user.role === 'writer') && (
                    <button 
                      onClick={handleDashboardClick}
                      className="text-sm font-bold text-blue-600 border-2 border-blue-600 px-6 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-100"
                    >
                      Dashboard
                    </button>
                  )}
                  {user.role === 'reader' && (
                    <button 
                      onClick={() => setIsAuthModalOpen(true)}
                      className="text-sm font-bold border-2 border-black px-6 py-2 rounded-full hover:bg-black hover:text-white transition-all"
                    >
                      Write
                    </button>
                  )}
                  <button onClick={() => logout()} className="text-black/40 hover:text-red-500 transition-colors" title="Logout">
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-sm font-bold bg-black text-white px-8 py-2.5 rounded-full hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-100 transition-all"
                >
                  Login / Join
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden bg-white border-b border-black/5 px-4 pt-2 pb-6 space-y-4"
            >
              {settings.navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-lg font-medium"
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <div className="space-y-4 pt-4 border-t border-black/5">
                  {(user.role === 'admin' || user.role === 'writer') && (
                    <button 
                      onClick={handleDashboardClick}
                      className="block w-full text-left text-lg font-bold text-blue-600"
                    >
                      Dashboard
                    </button>
                  )}
                  {user.role === 'reader' && (
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="block w-full text-left text-lg font-bold text-black"
                    >
                      Become a Writer
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }} 
                    className="block w-full text-left text-lg font-medium text-red-500 pt-2"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="block w-full text-left text-lg font-bold text-blue-600"
                >
                  Login / Join
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-black/5 py-20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-2xl font-serif font-bold mb-4">{settings.siteName}</h2>
              <p className="text-black/60 max-w-md leading-relaxed">
                {settings.siteDescription}
              </p>
              <div className="flex space-x-4 mt-8">
                {settings.socialLinks.instagram && (
                  <a href={settings.socialLinks.instagram} target="_blank" rel="noreferrer" className="text-black/40 hover:text-black transition-colors">
                    <Instagram size={20} />
                  </a>
                )}
                {settings.socialLinks.linkedin && (
                  <a href={settings.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-black/40 hover:text-black transition-colors">
                    <Linkedin size={20} />
                  </a>
                )}
                {settings.socialLinks.twitter && (
                  <a href={settings.socialLinks.twitter} target="_blank" rel="noreferrer" className="text-black/40 hover:text-black transition-colors">
                    <Twitter size={20} />
                  </a>
                )}
                {settings.socialLinks.youtube && (
                  <a href={settings.socialLinks.youtube} target="_blank" rel="noreferrer" className="text-black/40 hover:text-black transition-colors">
                    <Youtube size={20} />
                  </a>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-6">Explore</h3>
              <ul className="space-y-4">
                {settings.navigation.map((item) => (
                  <li key={item.href}>
                    <Link to={item.href} className="text-sm font-medium hover:text-blue-600 transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-6">Legal</h3>
              <ul className="space-y-4">
                <li>
                  <Link to="/terms" className="text-sm font-medium hover:text-blue-600 transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-sm font-medium hover:text-blue-600 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <a href="/sitemap.xml" target="_blank" className="text-sm font-medium hover:text-blue-600 transition-colors">
                    Sitemap
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-6">Newsletter</h3>
              <p className="text-sm text-black/60 mb-4">Get the latest stories delivered to your inbox.</p>
              <Link to="/newsletter" className="inline-block text-sm font-bold text-blue-600 hover:underline">
                Subscribe Now →
              </Link>
            </div>
          </div>
          <div className="border-t border-black/5 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-black/40">© {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/login" className="text-xs text-black/40 hover:text-black transition-colors">Admin Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
