import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import {
  GraduationCap,
  FolderGit2,
  BookOpen,
  Video,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { DragonEmblem } from '../../components/ui/DragonLogo';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [studentServices, setStudentServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api
      .get<{ success: boolean; services: any[] }>('/catalog/services', { forStudents: true })
      .then((res) => setStudentServices(res.services || []))
      .catch(() => setStudentServices([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-10 space-y-10 bg-[#050609]">
      {/* Student Welcome Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#11151D] via-[#161B26] to-[#11151D] border border-[#D6A94F]/40 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D6A94F]/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#050609] border border-[#D6A94F]/40 text-xs font-mono text-[#FFBD55]">
            <GraduationCap className="w-4 h-4 text-[#FFBD55]" />
            <span>ALLHUNTER STUDENT PLATFORM</span>
          </div>
          <DragonEmblem size={36} glow={true} variant="gold" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-vanguard font-bold text-white relative z-10">
          Student Workspace &amp; Viva Mentorship
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed relative z-10">
          Welcome, {user?.fullName}. Track your capstone prototype development, access mentoring resources, and prepare for viva examinations with senior engineering support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/50 transition-all space-y-3">
          <FolderGit2 className="w-6 h-6 text-[#FFBD55]" />
          <h3 className="text-base font-bold text-white">Capstone Prototypes</h3>
          <p className="text-xs text-[#9299A6] leading-relaxed">
            Submit your project proposal or final-year capstone requirements for full-stack prototype engineering.
          </p>
          <Link
            to="/portal/order/new"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FFBD55] hover:text-white transition-colors pt-2"
          >
            <span>Submit Project Order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/50 transition-all space-y-3">
          <Video className="w-6 h-6 text-[#78BFFF]" />
          <h3 className="text-base font-bold text-white">1-on-1 Code Mentoring</h3>
          <p className="text-xs text-[#9299A6] leading-relaxed">
            Schedule a screen-share session with a senior engineer to debug difficult errors and master your code for your viva.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#78BFFF] hover:text-white transition-colors pt-2"
          >
            <span>Book Mentoring</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/50 transition-all space-y-3">
          <BookOpen className="w-6 h-6 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Viva Voce Preparation</h3>
          <p className="text-xs text-[#9299A6] leading-relaxed">
            Review architecture blueprints, database normal forms, REST status codes, and security concepts for defense reviews.
          </p>
          <Link
            to="/allhunter"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-white transition-colors pt-2"
          >
            <span>Allhunter Guidelines</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Live Student Services from Catalog API */}
      <div className="space-y-4">
        <h3 className="text-xl font-display font-bold text-white">Available Student Services</h3>
        {isLoading ? (
          <div className="py-10 flex items-center justify-center gap-2 text-xs font-mono text-[#9299A6]">
            <Loader2 className="w-4 h-4 animate-spin text-[#FFBD55]" />
            <span>Loading student service catalog...</span>
          </div>
        ) : studentServices.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38] text-xs text-[#9299A6] text-center">
            No student programs are currently listed. Reach out via the{' '}
            <Link to="/contact" className="text-[#FFBD55] hover:underline">
              Contact Desk
            </Link>{' '}
            for customized student mentoring inquiries.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studentServices.map((svc) => {
              const priceInr = Math.round((svc.indicativeStartingPriceMinor || 0) / 100);
              return (
                <div
                  key={svc._id || svc.slug}
                  className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38] flex flex-col justify-between"
                >
                  <div>
                    <div className="text-xs font-mono text-[#FFBD55] mb-1 font-bold uppercase">
                      {svc.category?.replace(/_/g, ' ') || 'ALLHUNTER STUDENT SERVICE'}
                    </div>
                    <h4 className="text-base font-bold text-white mb-2">{svc.title}</h4>
                    <p className="text-xs text-[#9299A6] leading-relaxed mb-4">
                      {svc.shortDescription || svc.fullDescription}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#292E38]">
                    <span className="text-sm font-cyber font-bold text-[#F5D18A]">
                      {priceInr > 0 ? `From ₹${priceInr.toLocaleString('en-IN')}` : 'Custom Quote'}
                    </span>
                    <Link to="/portal/order/new" className="btn-gold-primary px-4 py-2 rounded-xl text-xs font-bold uppercase">
                      Request Guidance
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
