import React from 'react';
import { ShieldCheck, FileText, RefreshCw, Lock, Sparkles, Cookie } from 'lucide-react';
export { CareersPage } from './CareersPage';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 bg-[#050609]">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55]">
          <Lock className="w-3.5 h-3.5" />
          <span>DATA PROTECTION & ZERO LEAKAGE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white">Privacy Policy</h1>
        <p className="text-xs font-mono text-[#9299A6]">Effective: October 2026 • DRACOVION TECHNOLOGIES</p>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl bg-[#11151D] border border-[#292E38] space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed shadow-lg">
        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-white">1. Scope and Commitment</h2>
          <p>
            DRACOVION TECHNOLOGIES (&quot;we&quot;, &quot;our&quot;, &quot;platform&quot;) operates premium technology services, software architecture engineering, and the Allhunter student platform in Tamil Nadu and India. We respect your confidentiality and strictly limit data collection to what is strictly necessary for reviewing, quoting, delivering, and supporting software projects.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-white">2. Information We Collect</h2>
          <p>When you submit a project inquiry or register for an account, we collect:</p>
          <ul className="list-disc pl-5 space-y-1 text-[#9299A6]">
            <li>Contact details: Name, email address, optional contact telephone number.</li>
            <li>Project data: Requirements description, preferred deadlines, budget preferences, and uploaded assets.</li>
            <li>Technical session data: HTTP session cookies (with httpOnly & secure flags) and operational audit timestamps.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-white">3. How Your Information Is Used</h2>
          <p>
            Information is used solely to assess technical feasibility, prepare transparent quotations, manage project milestones, issue compliant billing invoices, and facilitate client communication. We never sell, rent, or trade your data to third-party ad networks.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-white">4. File and Deliverable Security</h2>
          <p>
            Uploaded specifications and project deliverables are stored in private object storage protected by server-side authorization checks. Only the owning client and authorized engineers can access private deliverables.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-white">5. Contact Regarding Privacy</h2>
          <p>
            If you wish to request deletion of your records or have questions regarding data handling, contact us directly at{' '}
            <a href="mailto:dracoviontechnology@gmail.com" className="text-[#FFBD55] underline">
              dracoviontechnology@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 bg-[#050609]">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55]">
          <FileText className="w-3.5 h-3.5" />
          <span>LEGAL FRAMEWORK & SERVICE AGREEMENT</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white">Terms of Service</h1>
        <p className="text-xs font-mono text-[#9299A6]">Last Revised: October 2026 • DRACOVION TECHNOLOGIES</p>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl bg-[#11151D] border border-[#292E38] space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed shadow-lg">
        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-white">1. Service Agreement & Scope</h2>
          <p>
            All custom software development, web applications, and consulting services provided by DRACOVION TECHNOLOGIES are governed by mutually accepted formal quotations. A quotation explicitly details scope, deliverables, revision limits, and estimated completion days.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-white">2. Quotation Acceptance & Binding Scope</h2>
          <p>
            A quotation accepted via the client dashboard forms the agreed basis of the project. Modifications to functional requirements after acceptance will be addressed through mutually agreed change requests.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-white">3. Intellectual Property Rights</h2>
          <p>
            Upon settlement of agreed milestone payments, all bespoke source code, database structures, and documentation delivered to the client become the sole property of the client.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-white">4. Allhunter Academic Integrity Standards</h2>
          <p>
            The Allhunter student platform is strictly an educational, mentoring, and prototype development assistance platform. Students are responsible for understanding their university guidelines and presenting legitimate work.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-white">5. Governing Law</h2>
          <p>
            These terms are governed by and construed under the laws of Tamil Nadu and the Republic of India.
          </p>
        </section>
      </div>
    </div>
  );
};

export const CookiePolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 bg-[#050609]">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55]">
          <Cookie className="w-3.5 h-3.5" />
          <span>SESSION COOKIE DISCLOSURE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white">Cookie Policy</h1>
        <p className="text-xs font-mono text-[#9299A6]">Last Revised: October 2026 • DRACOVION TECHNOLOGIES</p>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl bg-[#11151D] border border-[#292E38] space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed shadow-lg">
        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-white">1. Strict Essential Cookies Only</h2>
          <p>
            DRACOVION TECHNOLOGIES utilizes only essential, first-party HTTP session cookies required to authenticate and secure user sessions across the public website and client portals.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-white">2. No Third-Party Tracking Cookies</h2>
          <p>
            We do not deploy intrusive third-party advertising cookies, cross-site trackers, or behavioral profiling trackers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-white">3. Security Flags</h2>
          <p>
            All cookies issued by Dracovion are flagged with <code>HttpOnly</code>, <code>SameSite=Lax</code>, and <code>Secure</code> (in production) to protect against cross-site scripting (XSS) and request forgery (CSRF).
          </p>
        </section>
      </div>
    </div>
  );
};

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 bg-[#050609]">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55]">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>PAYMENTS & DISPUTE POLICIES</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white">Refund & Cancellation Policy</h1>
        <p className="text-xs font-mono text-[#9299A6]">Effective: October 2026 • DRACOVION TECHNOLOGIES</p>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl bg-[#11151D] border border-[#292E38] space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed shadow-lg">
        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-white">1. Milestone-Based Protection</h2>
          <p>
            To protect our clients, projects operate on transparent milestone approvals. Payments are tied to explicit milestones (e.g. Prototype, API Integration, Production Deployment). Once a milestone deliverable is inspected and approved by the client, funds for that milestone become non-refundable as engineering labor has been delivered.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-display font-bold text-white">2. Pre-Commencement Cancellation</h2>
          <p>
            If a client cancels an engagement before development commences, any unallocated advance payments will be promptly refunded, less nominal administrative processing costs.
          </p>
        </section>
      </div>
    </div>
  );
};
