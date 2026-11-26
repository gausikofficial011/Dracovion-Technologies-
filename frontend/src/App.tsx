import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Motion & Interactive Components
import { IntroAnimation } from './components/common/IntroAnimation';
import { CustomCursor } from './components/common/CustomCursor';
import { ScrollProgressBar } from './components/common/ScrollProgressBar';
import { SmoothScroll } from './components/common/SmoothScroll';
import { CyberBackgroundVideo } from './components/common/CyberBackgroundVideo';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { ServicesPage } from './pages/public/ServicesPage';
import { ServiceDetailPage } from './pages/public/ServiceDetailPage';
import { ProductsPage } from './pages/public/ProductsPage';
import { PortfolioPage } from './pages/public/PortfolioPage';
import { PortfolioDetailPage } from './pages/public/PortfolioDetailPage';
import { PricingPage } from './pages/public/PricingPage';
import { AllhunterPage } from './pages/public/AllhunterPage';
import { FAQPage } from './pages/public/FAQPage';
import { ContactPage } from './pages/public/ContactPage';
import { StartProjectPage } from './pages/public/StartProjectPage';
import { CareersPage } from './pages/public/CareersPage';
import { PrivacyPage, TermsPage, RefundPolicyPage, CookiePolicyPage } from './pages/public/LegalPages';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Auth & Portals
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Portal 01: Client Portal
import { ClientSignupPage } from './pages/portal/ClientSignupPage';
import { ClientLoginPage } from './pages/portal/ClientLoginPage';
import { NewOrderPage } from './pages/portal/NewOrderPage';
import { OrderDetailPage } from './pages/portal/OrderDetailPage';

// Portal 02: Internal Workspace
import { WorkspaceLoginPage } from './pages/workspace/WorkspaceLoginPage';
import { WorkspaceOrdersPage } from './pages/workspace/WorkspaceOrdersPage';
import { SuperAdminPage } from './pages/workspace/SuperAdminPage';

// Client Portal
import { ClientPortalLayout } from './layouts/ClientPortalLayout';
import { ClientDashboardPage } from './pages/client/ClientDashboardPage';
import { ClientOrdersPage } from './pages/client/ClientOrdersPage';
import { ClientProjectsPage } from './pages/client/ClientProjectsPage';
import { ClientProjectDetailPage } from './pages/client/ClientProjectDetailPage';
import { ClientQuotationsPage } from './pages/client/ClientQuotationsPage';
import { ClientFilesPage } from './pages/client/ClientFilesPage';
import { ClientMessagesPage } from './pages/client/ClientMessagesPage';
import { ClientProfilePage } from './pages/client/ClientProfilePage';

// Admin Portal
import { AdminPortalLayout } from './layouts/AdminPortalLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminLeadsPage } from './pages/admin/AdminLeadsPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminQuotationsPage } from './pages/admin/AdminQuotationsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminAnnouncementsPage } from './pages/admin/AdminAnnouncementsPage';
import { AdminMessagesPage } from './pages/admin/AdminMessagesPage';
import { PresidentAnnouncementBanner } from './components/common/PresidentAnnouncementBanner';

// Portals Foundations
import { StudentDashboardPage } from './pages/portals/StudentDashboardPage';
import { TeamDashboardPage } from './pages/portals/TeamDashboardPage';
import { PartnerDashboardPage } from './pages/portals/PartnerDashboardPage';

// Public Website Layout wrapper with Navbar, Footer and Motion Overlay
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[#E7E9EE] relative z-10 selection:bg-[#D6A94F]/30 selection:text-[#F5D18A]">
      <IntroAnimation />
      <CustomCursor />
      <ScrollProgressBar />
      <PresidentAnnouncementBanner />
      <Navbar />
      <main className="flex-1 relative">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Route protection component for authenticated users
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050609] text-[#9299A6] font-mono text-sm">
        Verifying Session...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SmoothScroll>
        <BrowserRouter>
          {/* Permanent Cyber Technology & Hacking Background Video Engine (Never Disabled) */}
          <CyberBackgroundVideo opacity={0.38} hueShift={true} />
          <Routes>
            {/* Public Website Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:slug" element={<ServiceDetailPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/projects" element={<PortfolioPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/portfolio/:slug" element={<PortfolioDetailPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/allhunter" element={<AllhunterPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/start-project" element={<StartProjectPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/cookies" element={<CookiePolicyPage />} />
              <Route path="/refund-policy" element={<RefundPolicyPage />} />

              {/* Student Foundation */}
              <Route
                path="/student/dashboard"
                element={
                  <RequireAuth>
                    <StudentDashboardPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/portal/student"
                element={
                  <RequireAuth>
                    <StudentDashboardPage />
                  </RequireAuth>
                }
              />

              {/* Team Foundation */}
              <Route
                path="/team/dashboard"
                element={
                  <RequireAuth>
                    <TeamDashboardPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/portal/team"
                element={
                  <RequireAuth>
                    <TeamDashboardPage />
                  </RequireAuth>
                }
              />

              {/* Partner Foundation */}
              <Route
                path="/partner/dashboard"
                element={
                  <RequireAuth>
                    <PartnerDashboardPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/portal/partner"
                element={
                  <RequireAuth>
                    <PartnerDashboardPage />
                  </RequireAuth>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* PORTAL 01: CLIENT PORTAL ROUTES */}
            <Route
              path="/portal/signup"
              element={<ClientSignupPage />}
            />
            <Route
              path="/signup"
              element={<ClientSignupPage />}
            />
            <Route
              path="/register"
              element={<ClientSignupPage />}
            />
            <Route
              path="/portal/login"
              element={<ClientLoginPage />}
            />
            <Route
              path="/signin"
              element={<ClientLoginPage />}
            />
            <Route
              path="/login"
              element={<ClientLoginPage />}
            />
            {/* PORTAL 01: CLIENT PORTAL AUTHENTICATED ROUTES */}
            <Route
              path="/portal"
              element={
                <RequireAuth>
                  <ClientPortalLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/portal/dashboard" replace />} />
              <Route path="dashboard" element={<ClientDashboardPage />} />
              <Route path="orders" element={<ClientOrdersPage />} />
              <Route path="order/new" element={<NewOrderPage />} />
              <Route path="order/:id" element={<OrderDetailPage />} />
              <Route path="projects" element={<ClientProjectsPage />} />
              <Route path="projects/:id" element={<ClientProjectDetailPage />} />
              <Route path="quotations" element={<ClientQuotationsPage />} />
              <Route path="billing" element={<Navigate to="/portal/dashboard" replace />} />
              <Route path="files" element={<ClientFilesPage />} />
              <Route path="messages" element={<ClientMessagesPage />} />
              <Route path="profile" element={<ClientProfilePage />} />
              <Route path="security" element={<ClientProfilePage />} />
            </Route>

            {/* Backward Compatibility /client Routes */}
            <Route
              path="/client"
              element={
                <RequireAuth>
                  <ClientPortalLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/portal/dashboard" replace />} />
              <Route path="dashboard" element={<ClientDashboardPage />} />
              <Route path="orders" element={<ClientOrdersPage />} />
              <Route path="projects" element={<ClientProjectsPage />} />
              <Route path="projects/:id" element={<ClientProjectDetailPage />} />
              <Route path="quotations" element={<ClientQuotationsPage />} />
              <Route path="billing" element={<Navigate to="/portal/dashboard" replace />} />
              <Route path="files" element={<ClientFilesPage />} />
              <Route path="messages" element={<ClientMessagesPage />} />
              <Route path="profile" element={<ClientProfilePage />} />
              <Route path="security" element={<ClientProfilePage />} />
            </Route>

            {/* PORTAL 02: INTERNAL WORKSPACE ROUTES (Staff Only) */}
            <Route
              path="/workspace/login"
              element={<WorkspaceLoginPage />}
            />
            <Route
              path="/workspace/orders"
              element={
                <RequireAuth>
                  <WorkspaceOrdersPage />
                </RequireAuth>
              }
            />
            <Route
              path="/workspace/dashboard"
              element={
                <RequireAuth>
                  <WorkspaceOrdersPage />
                </RequireAuth>
              }
            />
            <Route
              path="/workspace/super-admin"
              element={
                <RequireAuth>
                  <SuperAdminPage />
                </RequireAuth>
              }
            />

            <Route
              path="/forgot-password"
              element={<ForgotPasswordPage />}
            />

            {/* Owner & Administrator Portal Routes */}
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminPortalLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="messages" element={<AdminMessagesPage />} />
              <Route path="leads" element={<AdminLeadsPage />} />
              <Route path="projects" element={<AdminProjectsPage />} />
              <Route path="projects/:id" element={<AdminProjectsPage />} />
              <Route path="quotations" element={<AdminQuotationsPage />} />
              <Route path="announcements" element={<AdminAnnouncementsPage />} />
              <Route path="payments" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="invoices" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
              <Route path="profile" element={<ClientProfilePage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SmoothScroll>
    </AuthProvider>
  );
};

export default App;
