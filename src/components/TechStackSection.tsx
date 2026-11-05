import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { TechCategory } from '../types/portfolio.ts';
import { Cpu, Terminal, Sparkles } from 'lucide-react';

export const TechStackSection: React.FC = () => {
  const { data } = usePortfolio();
  const { techStack, visibility } = data;
  const [activeCategory, setActiveCategory] = useState<string>('All');

  if (visibility.techStack === false) return null;

  const categories: (TechCategory | 'All')[] = [
    'All',
    'Languages',
    'Frontend',
    'Backend',
    'AI & ML',
    'Visualization & Graphics',
    'Developer Tools',
    'Currently Learning'
  ];

  const levelBadges: Record<string, { label: string; style: string }> = {
    'Building with': {
      label: 'Building with',
      style: 'text-[#FCEE0A] border-[#FCEE0A]/40 bg-[#FCEE0A]/10'
    },
    'Learning': {
      label: 'Learning',
      style: 'text-amber-400 border-amber-400/40 bg-amber-400/10'
    },
    'Exploring': {
      label: 'Exploring',
      style: 'text-cyan-400 border-cyan-400/40 bg-cyan-400/10'
    }
  };

  const filteredTech = activeCategory === 'All'
    ? techStack
    : techStack.filter(t => t.category === activeCategory);

  return (
    <section id="tech-stack" className="py-24 relative border-t border-[rgba(255,255,255,0.06)] bg-[#08090A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="font-mono text-xs text-[#FCEE0A] tracking-widest uppercase mb-2 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>03. TECHNICAL ARSENAL</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F5F5F5] uppercase">
              Tools I Build With
            </h2>
            <p className="text-sm sm:text-base text-[#A0A4AC] mt-1 max-w-xl">
              Languages, libraries, and frameworks applied in active software development and systems learning.
            </p>
          </div>

          {/* Level Legend */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-[#A0A4AC]">STATUS:</span>
            <span className="flex items-center gap-1.5 text-[#FCEE0A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FCEE0A]" />
              <span>Building with</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Learning</span>
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Exploring</span>
            </span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-mono rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#FCEE0A] text-[#08090A] font-bold shadow-[0_0_12px_rgba(252,238,10,0.3)]'
                  : 'bg-[#111318] text-[#A0A4AC] hover:text-[#F5F5F5] border border-[rgba(255,255,255,0.06)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tech Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredTech.map((item) => {
            const badge = levelBadges[item.level] || levelBadges['Building with'];
            return (
              <div
                key={item.id}
                className="cyber-glass rounded-xl p-4 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-200 border border-[rgba(255,255,255,0.06)] hover:border-[rgba(252,238,10,0.4)]"
              >
                <div>
                  <div className="font-mono text-[10px] text-[#A0A4AC] uppercase tracking-wider mb-1">
                    {item.category}
                  </div>
                  <h4 className="text-base font-bold text-[#F5F5F5] group-hover:text-[#FCEE0A] transition-colors">
                    {item.name}
                  </h4>
                </div>

                <div className="mt-4 pt-2.5 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${badge.style}`}>
                    {badge.label}
                  </span>
                  <Terminal className="w-3 h-3 text-[#A0A4AC] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
