import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { DracovionLogo } from '../ui/DragonLogo';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Code2,
  Smartphone,
  Cpu,
  Layers,
  Palette,
  Cloud,
  Database,
  Terminal,
  LogOut,
  User,
  ShieldCheck,
  LayoutDashboard,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);
  }, [location.pathname]);

  const serviceCategories = [
    { title: 'Web Development', slug: 'web-development', icon: Code2, desc: 'High-performance bespoke web applications' },
    { title: 'Mobile App Development', slug: 'mobile-development', icon: Smartphone, desc: 'Native & cross-platform iOS/Android' },
    { title: 'AI & Machine Learning', slug: 'ai-ml', icon: Cpu, desc: 'Intelligent automation & neural architectures' },
    { title: 'Software Engineering', slug: 'software-development', icon: Layers, desc: 'Scalable full-stack enterprise systems' },
    { title: 'UI/UX Design', slug: 'ui-ux-design', icon: Palette, desc: 'Cinematic visual systems & interaction design' },
    { title: 'Cloud Solutions', slug: 'cloud-solutions', icon: Cloud, desc: 'AWS, GCP & Azure serverless infrastructure' },
    { title: 'Database Management', slug: 'database-management', icon: Database, desc: 'Optimized high-concurrency schemas' },
    { title: 'IT Consulting & Automation', slug: 'it-consulting', icon: Terminal, desc: 'System architecture & workflow bots' },
  ];

  const getDashboardPath = () => {
    if (!user) return '/signin';
    if (
      user.portalType === 'workspace' ||
      ['employee', 'owner', 'ceo', 'super_admin'].includes(user.role)
    ) {
      return user.role === 'super_admin' ? '/workspace/super-admin' : '/workspace/orders';
    }
    return '/portal/dashboard';
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full h-20 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#050609]/95 backdrop-blur-xl border-b border-[#292E38] shadow-[0_10px_35px_rgba(0,0,0,0.85)]'
          : 'bg-[#050609]/40 backdrop-blur-md border-b border-[#292E38]/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left: Official Company Dragon Logo with Generous Right Margin */}
        <div className="flex items-center shrink-0 mr-8 lg:mr-10 xl:mr-14">
          <Link
            to="/"
            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
            aria-label="Dracovion Technologies Homepage"
          >
            <DracovionLogo variant="horizontal" size="md" glow={true} />
          </Link>
        </div>

        {/* Center: Clean Core Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <Link
            to="/"
            className={`px-3.5 py-2 text-sm font-medium rounded-xl transition-colors relative ${
              isActive('/') && location.pathname === '/' ? 'text-white font-semibold' : 'text-[#9299A6] hover:text-white'
            }`}
          >
            <span>Home</span>
            {isActive('/') && location.pathname === '/' && (
              <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-gradient-to-r from-[#FFBD55] to-[#D6A94F] rounded-full" />
            )}
          </Link>

          <Link
            to="/about"
            className={`px-3.5 py-2 text-sm font-medium rounded-xl transition-colors relative ${
              isActive('/about') ? 'text-white font-semibold' : 'text-[#9299A6] hover:text-white'
            }`}
          >
            <span>About</span>
            {isActive('/about') && (
              <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-gradient-to-r from-[#FFBD55] to-[#D6A94F] rounded-full" />
            )}
          </Link>

          {/* Services Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setServicesDropdownOpen(true)}
            onMouseLeave={() => setServicesDropdownOpen(false)}
          >
            <Link
              to="/services"
              className={`px-3.5 py-2 text-sm font-medium rounded-xl transition-colors relative flex items-center gap-1.5 ${
                isActive('/services') ? 'text-white font-semibold' : 'text-[#9299A6] hover:text-white'
              }`}
            >
              <span>Services</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${servicesDropdownOpen ? 'rotate-180 text-[#FFBD55]' : ''}`}
              />
              {isActive('/services') && (
                <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-gradient-to-r from-[#FFBD55] to-[#D6A94F] rounded-full" />
              )}
            </Link>

            {servicesDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-[540px] pt-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 rounded-2xl bg-[#0A0D13]/98 backdrop-blur-2xl border border-[#D6A94F]/35 shadow-[0_20px_45px_rgba(0,0,0,0.95),0_0_25px_rgba(214,169,79,0.15)]">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#292E38]">
                    <span className="text-[11px] font-mono tracking-wider text-[#FFBD55] uppercase font-bold">
                      END-TO-END IT SOLUTIONS
                    </span>
                    <Link
                      to="/services"
                      className="text-xs text-[#D6A94F] hover:text-white flex items-center gap-1 font-medium"
                    >
                      <span>View All Offerings</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {serviceCategories.map((s) => {
                      const Icon = s.icon;
                      return (
                        <Link
                          key={s.slug}
                          to={`/services/${s.slug}`}
                          className="p-2.5 rounded-xl hover:bg-[#11151D] border border-transparent hover:border-[#292E38] transition-all group flex items-start gap-2.5"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#11151D] border border-[#292E38] group-hover:border-[#D6A94F]/50 flex items-center justify-center text-[#D6A94F] group-hover:text-[#FFBD55] flex-shrink-0 transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white group-hover:text-[#F5D18A] transition-colors leading-tight">
                              {s.title}
                            </div>
                            <div className="text-[10px] text-[#9299A6] line-clamp-1 mt-0.5">{s.desc}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            to="/products"
            className={`px-3.5 py-2 text-sm font-medium rounded-xl transition-colors relative ${
              isActive('/products') ? 'text-white font-semibold' : 'text-[#9299A6] hover:text-white'
            }`}
          >
            <span>Products</span>
            {isActive('/products') && (
              <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-gradient-to-r from-[#FFBD55] to-[#D6A94F] rounded-full" />
            )}
          </Link>

          <Link
            to="/projects"
            className={`px-3.5 py-2 text-sm font-medium rounded-xl transition-colors relative ${
              isActive('/projects') || isActive('/portfolio') ? 'text-white font-semibold' : 'text-[#9299A6] hover:text-white'
            }`}
          >
            <span>Projects</span>
            {(isActive('/projects') || isActive('/portfolio')) && (
              <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-gradient-to-r from-[#FFBD55] to-[#D6A94F] rounded-full" />
            )}
          </Link>

          <Link
            to="/careers"
            className={`px-3.5 py-2 text-sm font-medium rounded-xl transition-colors relative ${
              isActive('/careers') ? 'text-white font-semibold' : 'text-[#9299A6] hover:text-white'
            }`}
          >
            <span>Careers</span>
            {isActive('/careers') && (
              <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-gradient-to-r from-[#FFBD55] to-[#D6A94F] rounded-full" />
            )}
          </Link>

          <Link
            to="/pricing"
            className={`px-3.5 py-2 text-sm font-medium rounded-xl transition-colors relative ${
              isActive('/pricing') ? 'text-white font-semibold' : 'text-[#9299A6] hover:text-white'
            }`}
          >
            <span>Payment &amp; Bids</span>
            {isActive('/pricing') && (
              <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-gradient-to-r from-[#FFBD55] to-[#D6A94F] rounded-full" />
            )}
          </Link>

          <Link
            to="/contact"
            className={`px-3.5 py-2 text-sm font-medium rounded-xl transition-colors relative ${
              isActive('/contact') ? 'text-white font-semibold' : 'text-[#9299A6] hover:text-white'
            }`}
          >
            <span>Contact</span>
            {isActive('/contact') && (
              <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-gradient-to-r from-[#FFBD55] to-[#D6A94F] rounded-full" />
            )}
          </Link>
        </nav>

        {/* Right: Unified Sign In & Sign Up Portal Actions */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              <Link
                to={user?.portalType === 'workspace' ? '/admin/profile' : '/portal/profile'}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-[#080A0E] border border-[#292E38] hover:border-[#D6A94F] transition-all group"
                title="Edit My Profile & Photo"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName || 'User'}
                    className="w-7 h-7 rounded-lg object-cover object-top border border-[#D6A94F]"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FFBD55] to-[#D6A94F] text-[#050609] flex items-center justify-center font-bold text-xs">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="text-xs font-semibold text-white group-hover:text-[#FFBD55] transition-colors truncate max-w-[100px]">
                  {user?.fullName?.split(' ')[0] || 'My Account'}
                </span>
              </Link>

              <Link
                to={getDashboardPath()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#F5D18A] rounded-xl bg-[#11151D] border border-[#D6A94F]/40 hover:border-[#FFBD55] transition-all shadow-md"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#FFBD55]" />
                <span>
                  {user?.role === 'super_admin'
                    ? 'Super Admin'
                    : user?.portalType === 'workspace'
                    ? 'Staff Workspace'
                    : 'Client Portal'}
                </span>
              </Link>

              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                title="Sign Out"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              {/* Sign In link */}
              <Link
                to="/signin"
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-[#11151D]/60 rounded-xl transition-all"
              >
                Sign In
              </Link>

              {/* Sign Up button */}
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#050609] shadow-[0_0_20px_rgba(214,169,79,0.35)] hover:shadow-[0_0_30px_rgba(255,189,85,0.55)] hover:scale-[1.02] transition-all cursor-pointer"
                style={{
                  background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 50%, #F5D18A 100%)',
                }}
              >
                <span>Sign Up</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#050609]" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#11151D] border border-[#292E38] transition-colors cursor-pointer"
          aria-label="Toggle navigation drawer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 text-[#FFBD55]" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-20 bg-[#050609]/98 backdrop-blur-2xl border-b border-[#292E38] p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto z-50">
          <nav className="flex flex-col space-y-2">
            <Link
              to="/"
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-[#11151D]"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-[#11151D]"
            >
              About
            </Link>
            <Link
              to="/services"
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-[#11151D]"
            >
              Services
            </Link>
            <Link
              to="/products"
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-[#11151D]"
            >
              Products
            </Link>
            <Link
              to="/projects"
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-[#11151D]"
            >
              Projects
            </Link>
            <Link
              to="/careers"
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-[#11151D]"
            >
              Careers
            </Link>
            <Link
              to="/pricing"
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-[#11151D]"
            >
              Payment &amp; Bids
            </Link>
            <Link
              to="/contact"
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-[#11151D]"
            >
              Contact &amp; Chat
            </Link>
          </nav>

          <div className="pt-4 border-t border-[#292E38] flex flex-col gap-2.5">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#080A0E] border border-[#292E38]">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName || 'User'}
                      className="w-10 h-10 rounded-xl object-cover object-top border border-[#D6A94F]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFBD55] to-[#D6A94F] text-[#050609] flex items-center justify-center font-bold text-sm">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-bold text-white truncate">{user?.fullName}</div>
                    <div className="text-[10px] font-mono text-[#FFBD55] uppercase">{user?.email}</div>
                  </div>
                </div>

                <Link
                  to={user?.portalType === 'workspace' ? '/admin/profile' : '/portal/profile'}
                  className="w-full py-2.5 rounded-xl text-center text-xs font-semibold text-white bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]"
                >
                  Edit Profile & Photo
                </Link>

                <Link
                  to={getDashboardPath()}
                  className="w-full py-3 rounded-xl text-center text-xs font-bold uppercase tracking-wider text-[#050609] bg-gradient-to-r from-[#D6A94F] to-[#FFBD55]"
                >
                  Go to Dashboard
                </Link>

                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-center text-xs font-semibold text-rose-400 bg-rose-950/20 border border-rose-900/40"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/signin"
                  className="py-3 rounded-xl text-center text-xs font-bold uppercase tracking-wider text-white bg-[#11151D] border border-[#292E38]"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="py-3 rounded-xl text-center text-xs font-bold uppercase tracking-wider text-[#050609] bg-gradient-to-r from-[#D6A94F] to-[#FFBD55]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
