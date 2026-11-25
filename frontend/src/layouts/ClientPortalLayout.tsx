import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DracovionLogo } from '../components/ui/DragonLogo';
import { CustomCursor } from '../components/common/CustomCursor';
import { ScrollProgressBar } from '../components/common/ScrollProgressBar';
import { PortalSocialLinks } from '../components/layout/PortalSocialLinks';
import {
  LayoutDashboard,
  FolderGit2,
  FileCheck,
  Receipt,
  DownloadCloud,
  MessageSquare,
  User,
  LogOut,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  PlusCircle,
  Sparkles,
  Layers,
  Package,
} from 'lucide-react';

export const ClientPortalLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Command Dashboard', path: '/portal/dashboard', alias: '/client/dashboard', icon: LayoutDashboard },
    { label: 'Given Orders', path: '/portal/orders', alias: '/client/orders', icon: Package },
    { label: 'Order New Project', path: '/portal/order/new', icon: PlusCircle },
    { label: 'My Projects', path: '/portal/projects', alias: '/client/projects', icon: FolderGit2 },
    { label: 'Quotations & Scopes', path: '/portal/quotations', alias: '/client/quotations', icon: FileCheck },
    { label: 'Deliverables & Files', path: '/portal/files', alias: '/client/files', icon: DownloadCloud },
    { label: 'Direct Messages', path: '/portal/messages', alias: '/client/messages', icon: MessageSquare },
    { label: 'Profile & Security', path: '/portal/profile', alias: '/client/profile', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-[#050609]/80 backdrop-blur-sm flex flex-col md:flex-row text-slate-200 selection:bg-[#D6A94F]/30 selection:text-[#F5D18A]">
      <CustomCursor />
      <ScrollProgressBar />

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-[#0A0D13]/95 backdrop-blur-md border-b md:border-b-0 md:border-r border-[#292E38] flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto z-30">
        <div>
          {/* Logo Brand Header */}
          <div className="h-20 flex items-center justify-between gap-2 px-4 border-b border-[#292E38]/80 bg-[#050609]/60">
            <Link to="/" aria-label="Dracovion Home" className="shrink-0">
              <DracovionLogo variant="compact" size="sm" glow={true} />
            </Link>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#11151D] border border-[#292E38] text-[#FFBD55] shrink-0 whitespace-nowrap">
              CLIENT PORTAL
            </span>
          </div>

          {/* User Badge Card */}
          <div className="p-4 mx-3 my-4 rounded-2xl bg-[#080A0E] border border-[#D6A94F]/30 shadow-lg flex items-center gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName || 'User'}
                className="w-10 h-10 rounded-xl object-cover object-top border border-[#D6A94F] shadow-md shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFBD55] via-[#D6A94F] to-[#F5D18A] text-[#050609] flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                {user?.fullName?.charAt(0) || 'C'}
              </div>
            )}
            <div className="overflow-hidden flex-1">
              <div className="text-sm font-bold text-white truncate">{user?.fullName || 'Valued Client'}</div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#D6A94F]">
                {user?.accountType === 'student' || user?.collegeOrUniversity ? (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-[#FFBD55] shrink-0" />
                    <span className="truncate text-[#FFBD55]">{user?.collegeOrUniversity || 'Student Researcher'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#52D69A] shrink-0" />
                    <span className="truncate">{user?.companyName || 'Verified Corporate Client'}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.alias && location.pathname.startsWith(item.alias));
              const isOrderNew = item.path === '/portal/order/new';

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#11151D] text-[#FFBD55] border border-[#D6A94F]/60 shadow-[0_0_15px_rgba(214,169,79,0.2)] font-semibold'
                      : isOrderNew
                      ? 'text-[#FFBD55] bg-[#11151D]/60 border border-[#D6A94F]/30 hover:bg-[#11151D] hover:border-[#FFBD55]'
                      : 'text-[#9299A6] hover:text-white hover:bg-[#11151D]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFBD55]' : isOrderNew ? 'text-[#FFBD55]' : 'text-[#9299A6]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive ? (
                    <ChevronRight className="w-3.5 h-3.5 text-[#FFBD55]" />
                  ) : isOrderNew ? (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#D6A94F]/20 text-[#FFBD55]">NEW</span>
                  ) : null}
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
            className="flex items-center justify-center w-full px-4 py-2 rounded-xl text-xs font-mono text-[#9299A6] hover:text-[#FFBD55] hover:bg-[#11151D] transition-colors"
          >
            &larr; Back to Public Website
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

      {/* Main Client Viewport with Top Bar */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 px-6 lg:px-10 border-b border-[#292E38]/80 bg-[#0A0D13]/90 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#52D69A] animate-pulse" />
            <span className="text-xs font-mono font-bold text-[#FFBD55] uppercase tracking-wider hidden sm:inline">
              DRACOVION CLIENT CLOUD
            </span>
            <span className="text-xs font-mono text-[#9299A6]">• Secure Channel</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/portal/order/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#050609] shadow-[0_0_15px_rgba(214,169,79,0.35)] hover:scale-105 transition-all"
              style={{
                background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 100%)',
              }}
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#050609]" />
              <span>+ Place Order</span>
            </Link>

            <Link
              to="/portal/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F] text-[#9299A6] hover:text-white transition-all text-xs font-medium"
              title="My Profile & Security"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName || 'User'}
                  className="w-5 h-5 rounded-full object-cover object-top border border-[#D6A94F]"
                />
              ) : (
                <User className="w-4 h-4 text-[#D6A94F]" />
              )}
              <span className="hidden sm:inline text-white font-medium truncate max-w-[120px]">
                {user?.fullName?.split(' ')[0] || 'Profile'}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-400 bg-rose-950/30 border border-rose-900/40 hover:bg-rose-900/30 hover:border-rose-700/60 transition-all cursor-pointer"
              title="Sign Out of Portal"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Content Region */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#050609]">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
