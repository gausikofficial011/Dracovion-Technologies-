import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Code2, Database, Cpu, Cloud, Wrench, Layers } from 'lucide-react';

interface TechItem {
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'AI' | 'Cloud' | 'Tools';
  proficiency: string;
  desc: string;
}

export const TechEcosystemSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'Frontend' | 'Backend' | 'Database' | 'AI' | 'Cloud' | 'Tools'>('All');

  const technologies: TechItem[] = [
    // Frontend
    { name: 'React', category: 'Frontend', proficiency: 'Advanced', desc: 'Component architectures, virtual DOM, React 19' },
    { name: 'TypeScript', category: 'Frontend', proficiency: 'Mastery', desc: 'Strict static typing & contract enforcement' },
    { name: 'JavaScript', category: 'Frontend', proficiency: 'Mastery', desc: 'Modern ECMAScript standards, asynchronous runtimes' },
    { name: 'HTML5 / CSS3', category: 'Frontend', proficiency: 'Mastery', desc: 'Semantic layouts, canvas, and responsive grid systems' },
    { name: 'Tailwind CSS', category: 'Frontend', proficiency: 'Mastery', desc: 'Design tokens, rapid modular utilities, JIT compilation' },
    // Backend
    { name: 'Node.js', category: 'Backend', proficiency: 'Advanced', desc: 'High-throughput asynchronous event-driven runtime' },
    { name: 'Express.js', category: 'Backend', proficiency: 'Advanced', desc: 'Robust RESTful APIs, middleware & session engines' },
    { name: 'Python', category: 'Backend', proficiency: 'Advanced', desc: 'Data processing pipelines, scientific scripting' },
    { name: 'FastAPI', category: 'Backend', proficiency: 'Proficient', desc: 'Async Python microservices with automatic OpenAPI' },
    // Database
    { name: 'MongoDB', category: 'Database', proficiency: 'Mastery', desc: 'Mongoose schemas, aggregation pipelines, Atlas clusters' },
    { name: 'PostgreSQL', category: 'Database', proficiency: 'Advanced', desc: 'Relational ACID transactions and JSONB storage' },
    { name: 'MySQL', category: 'Database', proficiency: 'Advanced', desc: 'Structured relational data stores & indexing' },
    { name: 'Redis', category: 'Database', proficiency: 'Advanced', desc: 'In-memory caching, rate limiting, and session keys' },
    // AI
    { name: 'TensorFlow', category: 'AI', proficiency: 'Proficient', desc: 'Neural network training and production export' },
    { name: 'PyTorch', category: 'AI', proficiency: 'Proficient', desc: 'Deep learning research, dynamic computation graphs' },
    { name: 'Scikit-learn', category: 'AI', proficiency: 'Advanced', desc: 'Predictive classification, clustering and regressions' },
    // Cloud
    { name: 'Amazon Web Services', category: 'Cloud', proficiency: 'Advanced', desc: 'S3, EC2, Lambda, CloudFront distribution' },
    { name: 'Google Cloud Platform', category: 'Cloud', proficiency: 'Advanced', desc: 'Compute Engine, Cloud Run, Cloud Storage' },
    { name: 'Microsoft Azure', category: 'Cloud', proficiency: 'Proficient', desc: 'Enterprise identity, virtual machines, blob stores' },
    // Tools
    { name: 'GitHub', category: 'Tools', proficiency: 'Mastery', desc: 'CI/CD workflows, semantic versioning, code reviews' },
    { name: 'Figma', category: 'Tools', proficiency: 'Mastery', desc: 'Wireframing, design systems, design-to-code tokens' },
    { name: 'Postman', category: 'Tools', proficiency: 'Mastery', desc: 'API testing suites, automated collection runs' },
  ];

  const categories = ['All', 'Frontend', 'Backend', 'Database', 'AI', 'Cloud', 'Tools'] as const;

  const filteredTechs = activeTab === 'All' ? technologies : technologies.filter((t) => t.category === activeTab);

  return (
    <section className="relative py-24 bg-[#050609]" aria-label="Technology Ecosystem">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#11151D] border border-[#D6A94F]/30 text-xs font-mono text-[#FFBD55] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PRODUCTION-PROVEN STACK</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-vanguard font-extrabold text-white tracking-tight">
            TECHNOLOGY <span className="text-cyber-gradient">ECOSYSTEM.</span>
          </h2>
          <p className="mt-4 text-base text-[#9299A6]">
            Every system we engineer relies upon proven, industry-standard languages, frameworks, and cloud runtimes.
          </p>

          {/* Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveTab(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                  activeTab === cat
                    ? 'bg-gradient-to-r from-[#FFBD55] to-[#D6A94F] text-[#050609] font-bold shadow-md shadow-[#D6A94F]/20'
                    : 'bg-[#11151D] text-[#9299A6] hover:text-white border border-[#292E38] hover:border-[#D6A94F]/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tech Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTechs.map((tech, idx) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.03 }}
              className="p-5 rounded-2xl bg-[#11151D] border border-[#292E38] hover:border-[#D6A94F]/50 transition-all hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono tracking-wider text-[#D6A94F] uppercase font-semibold">
                    {tech.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono text-[#78BFFF] bg-[#78BFFF]/10 border border-[#78BFFF]/20">
                    {tech.proficiency}
                  </span>
                </div>

                <div className="font-display font-bold text-white text-base sm:text-lg group-hover:text-[#F5D18A] transition-colors">
                  {tech.name}
                </div>
              </div>

              <div className="mt-2 text-[11px] text-[#9299A6] line-clamp-2 leading-relaxed">
                {tech.desc}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

