import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Quote, Star, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  location: string;
  rating: number;
  verified: boolean;
}

export const TestimonialsSection: React.FC = () => {
  // Production Mode: Zero demo data. Real customer feedback will be loaded from verified database records.
  const testimonials: Testimonial[] = [];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const current = testimonials[currentIndex];

  return (
    <section className="relative py-24 bg-[#0A0D13] border-t border-[#292E38]" aria-label="Client Testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AUTHENTIC CLIENT & STUDENT FEEDBACK</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
            CLIENT PERSPECTIVES.
          </h2>
          <p className="mt-4 text-base text-[#9299A6]">
            Genuine testimonials from business founders and mentored engineering students across Tamil Nadu.
          </p>
        </div>

        {testimonials.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#11151D] border border-[#292E38] text-center max-w-xl mx-auto">
            <Quote className="w-12 h-12 text-[#9299A6] mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-bold text-white mb-2">Verified Feedback Under Review</h3>
            <p className="text-sm text-[#9299A6]">
              We adhere to strict transparency standards. Authentic testimonials will be populated as customer consent verifications are finalized.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="relative p-8 sm:p-12 rounded-3xl bg-[#11151D] border border-[#292E38] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
              {/* Gold Ambient Shimmer */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#D6A94F]/10 blur-3xl rounded-full pointer-events-none" />

              <div className="relative z-10 flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <Quote className="w-10 h-10 text-[#FFBD55] opacity-80" />
                    <div className="flex items-center gap-1">
                      {Array.from({ length: current.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#FFBD55] text-[#FFBD55]" />
                      ))}
                    </div>
                  </div>

                  <p className="text-lg sm:text-xl text-slate-200 font-normal leading-relaxed italic mb-8">
                    "{current.quote}"
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-[#292E38] gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-white text-base">
                        {current.author}
                      </span>
                      {current.verified && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#D6A94F] mt-0.5">
                      {current.role} • {current.company}
                    </div>
                    <div className="text-[11px] text-[#9299A6] mt-0.5 font-mono">
                      {current.location}
                    </div>
                  </div>

                  {/* Carousel Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevSlide}
                      className="p-2.5 rounded-xl bg-[#050609] border border-[#292E38] text-slate-300 hover:text-white hover:border-[#FFBD55] transition-colors cursor-pointer"
                      aria-label="Previous testimonial"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-mono text-[#9299A6] px-2">
                      {currentIndex + 1} / {testimonials.length}
                    </span>
                    <button
                      onClick={nextSlide}
                      className="p-2.5 rounded-xl bg-[#050609] border border-[#292E38] text-slate-300 hover:text-white hover:border-[#FFBD55] transition-colors cursor-pointer"
                      aria-label="Next testimonial"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

