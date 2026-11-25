import React from 'react';
import { Link } from 'react-router-dom';
import { productsList } from '../../sections/products/ProductsSection';
import { Sparkles, ArrowRight, Shield, ExternalLink, Cpu, CheckCircle2, Lock } from 'lucide-react';
import { GithubIcon } from '../../components/ui/GithubIcon';

export const ProductsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 bg-transparent relative z-10 select-none">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AUTONOMOUS DIGITAL INTELLECTUAL PROPERTY</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-vanguard font-extrabold text-gold-gradient tracking-tight">
          Products & Innovations
        </h1>
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          Dracovion Technologies architects, builds, and maintains autonomous software ecosystems tackling real problems in education, enterprise operations, and zero-trust asset security.
        </p>
      </div>

      {/* Products Showcase */}
      <div className="space-y-12">
        {productsList.map((product) => (
          <div
            key={product.id}
            className="p-8 sm:p-12 rounded-3xl bg-[#080A0E]/90 backdrop-blur-md border border-[#292E38] hover:border-[#D6A94F]/60 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.85)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#D6A94F]/10 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Product Info (Col 1-7) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-mono text-[#9299A6] uppercase tracking-wider">
                    {product.category}
                  </span>
                  <span
                    className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase flex items-center gap-1.5 ${
                      product.status === 'Live Platform'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                        : 'bg-[#D6A94F]/15 text-[#FFBD55] border border-[#D6A94F]/40'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    <span>{product.status}</span>
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
                  {product.name}
                </h2>

                <p className="text-sm font-mono text-[#FFBD55]">
                  {product.tagline}
                </p>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {product.description}
                </p>

                {/* Key Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {product.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-[#D6A94F] flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <Link
                    to={product.href}
                    className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#050609] inline-flex items-center gap-2 shadow-[0_0_20px_rgba(214,169,79,0.35)] hover:shadow-[0_0_30px_rgba(255,189,85,0.55)] transition-all cursor-pointer"
                    style={{
                      background: 'linear-gradient(90deg, #D6A94F 0%, #FFBD55 50%, #F5D18A 100%)',
                    }}
                  >
                    <span>Access Platform Details</span>
                    <ArrowRight className="w-4 h-4 text-[#050609]" />
                  </Link>

                  {product.githubUrl && (
                    <a
                      href={product.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/50 text-xs font-mono text-white transition-all hover:bg-[#15191F]"
                    >
                      <GithubIcon className="w-4 h-4 text-[#D6A94F]" />
                      <span>GitHub Source</span>
                      <ExternalLink className="w-3 h-3 text-[#9299A6]" />
                    </a>
                  )}
                </div>
              </div>

              {/* Product Telemetry / Metrics (Col 8-12) */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-[#080A0E] border border-[#292E38] space-y-4">
                <div className="text-xs font-mono font-bold tracking-widest text-[#FFBD55] uppercase pb-2 border-b border-[#292E38]">
                  VERIFIED PLATFORM TELEMETRY
                </div>

                <div className="space-y-3">
                  {product.metrics.map((m, mIdx) => (
                    <div key={mIdx} className="p-3 rounded-xl bg-[#11151D] border border-[#292E38]/80 text-xs font-mono text-slate-200 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#FFBD55] shrink-0" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

