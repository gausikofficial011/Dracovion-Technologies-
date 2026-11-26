import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DracovionLogo } from '../components/ui/DragonLogo';
import { CustomCursor } from '../components/common/CustomCursor';
import { ScrollProgressBar } from '../components/common/ScrollProgressBar';
import { PortalSocialLinks } from '../components/layout/PortalSocialLinks';
import {
  LayoutDashboard,
  Users,
  Inbox,
  FolderGit2,
  FileCheck,
  ShieldCheck,
  Sliders,
  LogOut,
  ChevronRight,
  History,
  Lock,
  Radio,
  User,
  MessageSquare,
} from 'lucide-react';

export const AdminPortalLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Enforce access control (President, Super Admin, CEO, and Admin)
  if (!user || !['owner', 'super_admin', 'ceo', 'admin'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#050609] flex items-center justify-center p-4 text-center">
        <div className="p-8 rounded-3xl bg-[#11151D] border border-[#292E38] max-w-md space-y-4">
          <Lock className="w-12 h-12 text-[#FFBD55] mx-auto" />
          <h2 className="text-xl font-display font-bold text-white">Administrative Access Required</h2>
          <p className="text-xs text-[#9299A6]">
            Only the President, Super Admin, CEO, or authorized administrators can access this governance portal.
          </p>
          <Link
            to="/login"
            className="btn-gold-primary inline-block px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            Sign In with Administrator Account
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Client Direct Messages', path: '/admin/messages', icon: MessageSquare },
    { label: 'Leads & Enquiries', path: '/admin/leads', icon: Inbox },
    { label: 'Projects & Orders', path: '/admin/projects', icon: FolderGit2 },
    { label: 'Engineering Orders Desk', path: '/workspace/orders', icon: FolderGit2 },
    { label: 'Quotations & Proposals', path: '/admin/quotations', icon: FileCheck },
    { label: "President's Broadcasts", path: '/admin/announcements', icon: Radio },
    { label: 'Users & Fraud Control', path: '/admin/users', icon: Users },
    { label: 'Audit Trail Logs', path: '/admin/audit-logs', icon: History },
    { label: 'Profile & Picture', path: '/admin/profile', icon: User },
    { label: 'Platform Settings', path: '/admin/settings', icon: Sliders },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#050609]/80 backdrop-blur-sm flex flex-col md:flex-row text-slate-200">
      <CustomCursor />
      <ScrollProgressBar />

      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-[#0A0D13]/95 backdrop-blur-md border-b md:border-b-0 md:border-r border-[#292E38] flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto z-30">
        <div>
          {/* Logo Brand */}
          <div className="h-20 flex items-center justify-between gap-2 px-5 border-b border-[#292E38]/80 bg-[#050609]/60">
            <Link to="/" aria-label="Dracovion Home" className="shrink-0">
              <DracovionLogo variant="compact" size="sm" glow={true} />
            </Link>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#11151D] border border-[#D6A94F]/40 text-[#FFBD55] shrink-0 whitespace-nowrap">
              ADMIN PORTAL
            </span>
          </div>

          {/* Admin badge */}
          <div className="p-4 mx-3 my-4 rounded-2xl bg-[#11151D] border border-[#D6A94F]/30 shadow-lg flex items-center gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName || 'Admin'}
                className="w-10 h-10 rounded-xl object-cover object-top border border-[#D6A94F] shadow-md shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFBD55] to-[#D6A94F] text-[#050609] flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                {user?.fullName.charAt(0)}
              </div>
            )}
            <div className="overflow-hidden flex-1">
              <div className="text-sm font-bold text-white truncate">{user?.fullName}</div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#FFBD55] uppercase font-semibold">
                <ShieldCheck className="w-3 h-3 text-[#FFBD55] shrink-0" />
                <span className="truncate">{user?.role}</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#11151D] text-[#FFBD55] border border-[#D6A94F]/50 shadow-sm font-semibold'
                      : 'text-[#9299A6] hover:text-white hover:bg-[#11151D]/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FFBD55]' : 'text-[#9299A6]'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#FFBD55] shrink-0" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#292E38] space-y-2 bg-[#050609]/40">
          <PortalSocialLinks />
          <Link
            to="/"
            className="flex items-center justify-center w-full px-4 py-2 rounded-xl text-xs font-mono text-[#9299A6] hover:text-white hover:bg-[#11151D] transition-colors"
          >
            &larr; Public Website
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-900/50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Administrative Viewport */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-screen bg-[#050609] p-5 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};
