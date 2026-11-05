import React from 'react';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { Target, ShieldCheck, FileText, Repeat, Lightbulb } from 'lucide-react';

export const EngineeringPrinciplesSection: React.FC = () => {
  const { data } = usePortfolio();
  const { principles, visibility } = data;

  if (visibility.principles === false) return null;

  const iconMap: Record<string, React.ReactNode> = {
    'Target': <Target className="w-5 h-5 text-[#FCEE0A]" />,
    'ShieldCheck': <ShieldCheck className="w-5 h-5 text-[#FCEE0A]" />,
    'FileText': <FileText className="w-5 h-5 text-[#FCEE0A]" />,
    'Repeat': <Repeat className="w-5 h-5 text-[#FCEE0A]" />,
  };

  return (
    <section id="principles" className="py-24 relative border-t border-[rgba(255,255,255,0.06)] bg-[#08090A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col mb-12">
          <div className="font-mono text-xs text-[#FCEE0A] tracking-widest uppercase mb-2 flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>05. FIRST PRINCIPLES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F5F5F5] uppercase">
            How I Think About Engineering
          </h2>
          <p className="text-sm sm:text-base text-[#A0A4AC] mt-1 max-w-xl">
            Heuristics that guide technical decisions, system architecture, and code verification.
          </p>
        </div>

        {/* 4 Principle Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {principles.map((p, idx) => (
            <div
              key={p.id || idx}
              className="cyber-glass rounded-xl p-6 relative flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300 border border-[rgba(255,255,255,0.08)] hover:border-[rgba(252,238,10,0.5)]"
            >
              {/* Corner tick */}
              <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#FCEE0A]/40 group-hover:border-[#FCEE0A]" />

              <div>
                <div className="w-10 h-10 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.08)] group-hover:border-[#FCEE0A]/40 flex items-center justify-center mb-4 transition-colors">
                  {iconMap[p.iconName] || <Target className="w-5 h-5 text-[#FCEE0A]" />}
                </div>

                <div className="font-mono text-[10px] text-[#A0A4AC] uppercase tracking-wider mb-1">
                  RULE 0{idx + 1}
                </div>

                <h3 className="text-lg font-bold text-[#F5F5F5] group-hover:text-[#FCEE0A] transition-colors mb-2">
                  {p.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#A0A4AC] leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-[rgba(255,255,255,0.06)] font-mono text-[10px] text-[#A0A4AC] flex items-center justify-between">
                <span>INVARIANT</span>
                <span className="text-[#FCEE0A]">ENFORCED</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
