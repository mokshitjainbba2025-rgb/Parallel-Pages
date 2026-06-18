import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { LayoutDashboard, FileText, PlusCircle, LogOut, Globe, Bell, User, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function WriterLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', href: '/writer', icon: LayoutDashboard },
    { label: 'My Stories', href: '/writer/posts', icon: FileText },
    { label: 'New Story', href: '/writer/new', icon: PlusCircle },
    { label: 'My Profile', href: '/writer/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFB] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <Link to="/" className="text-xl font-serif font-bold tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">P</div>
            Writer Studio
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                location.pathname === item.href
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-black"
              )}
            >
              <item.icon size={18} className={cn(
                "transition-transform",
                location.pathname === item.href ? "scale-110" : "group-hover:scale-110"
              )} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold">
              {navItems.find(i => i.href === location.pathname)?.label || 'Writer Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-gray-500 hover:text-black flex items-center gap-2">
              <Globe size={16} /> Live Blog
            </Link>
            <div className="h-6 w-px bg-gray-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">{user?.displayName}</p>
                <p className="text-[10px] text-blue-600 mt-1 uppercase font-bold tracking-widest leading-none">{user?.role} Profile</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 overflow-hidden flex items-center justify-center text-blue-600">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User size={20} />
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
