import React from 'react';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { Hammer, Cpu, Gauge, GraduationCap, MapPin, Sparkles } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { data } = usePortfolio();
  const { identity } = data;

  if (data.visibility.about === false) return null;

  const philosophyIcons = [
    <Hammer className="w-5 h-5 text-[#FCEE0A]" />,
    <Cpu className="w-5 h-5 text-[#FCEE0A]" />,
    <Gauge className="w-5 h-5 text-[#FCEE0A]" />
  ];

  return (
    <section id="about" className="py-24 relative border-t border-[rgba(255,255,255,0.06)] bg-[#08090A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col mb-12">
          <div className="font-mono text-xs text-[#FCEE0A] tracking-widest uppercase mb-2">
            01. PHILOSOPHY & IDENTITY
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F5F5F5] uppercase">
            {identity.aboutHeading || 'Engineer in Progress. Builder by Practice.'}
          </h2>
        </div>

        {/* Two-Column Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-16">
          
          {/* Main Bio Text (7 cols) */}
          <div className="lg:col-span-7 space-y-4 text-base sm:text-lg text-[#A0A4AC] leading-relaxed">
            <p className="text-[#F5F5F5] font-medium text-lg sm:text-xl">
              {identity.aboutText}
            </p>
            <p>
              I believe true engineering competence is not about memorizing syntax or stacking buzzwords. It comes from dissecting why systems fail under load, verifying mathematical constraints, and translating abstract algorithms into robust, running software.
            </p>
          </div>

          {/* Quick Stats / Affiliation Glass Panel (5 cols) */}
          <div className="lg:col-span-5 cyber-glass rounded-xl p-6 relative">
            <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#FCEE0A]" />
            <div className="font-mono text-xs text-[#FCEE0A] tracking-wider uppercase mb-4 pb-2 border-b border-[rgba(255,255,255,0.06)]">
              ACADEMIC_SPECS // MIT CHENNAI
            </div>
            
            <div className="flex flex-col gap-4 font-mono text-xs">
              <div className="flex items-start gap-3">
                <GraduationCap className="w-4 h-4 text-[#FCEE0A] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[#F5F5F5] font-semibold">B.E. Computer Science & Engineering</div>
                  <div className="text-[#A0A4AC]">Madras Institute of Technology (Anna University)</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#FCEE0A] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[#F5F5F5] font-semibold">Chennai, Tamil Nadu, India</div>
                  <div className="text-[#A0A4AC]">Class of 2030</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#FCEE0A] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[#FCEE0A] font-semibold">Core Focus Areas</div>
                  <div className="text-[#A0A4AC]">Systems Architecture · Computational Geometry · Applied AI Pipelines</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 3 Core Philosophy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {identity.philosophies.map((card, idx) => (
            <div
              key={idx}
              className="cyber-glass rounded-xl p-6 relative group flex flex-col justify-between hover:-translate-y-1 transition-all duration-300"
            >
              {/* Corner tick */}
              <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-[#FCEE0A]/40 group-hover:border-[#FCEE0A] transition-colors" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.08)] group-hover:border-[#FCEE0A]/50 flex items-center justify-center transition-colors">
                    {philosophyIcons[idx % philosophyIcons.length]}
                  </div>
                  <span className="font-mono text-xs text-[#A0A4AC] tracking-wider">
                    0{idx + 1}
                  </span>
                </div>

                <div className="mb-2">
                  <h3 className="text-xl font-bold text-[#F5F5F5] group-hover:text-[#FCEE0A] transition-colors uppercase tracking-tight">
                    {card.title}
                  </h3>
                  <div className="font-mono text-xs text-[#FCEE0A] tracking-wider mt-0.5">
                    {card.subtitle}
                  </div>
                </div>

                <p className="text-sm text-[#A0A4AC] leading-relaxed mt-3">
                  {card.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-[11px] font-mono text-[#A0A4AC]">
                <span>CORE_TENET</span>
                <span className="text-[#FCEE0A]">ACTIVE</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
