import React from 'react';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { Compass, CheckCircle, ArrowUpRight, Target } from 'lucide-react';

export const LearningTrackSection: React.FC = () => {
  const { data } = usePortfolio();
  const { learningTracks, visibility } = data;

  if (visibility.learningTrack === false) return null;

  const activeTracks = learningTracks
    .filter(t => t.priority !== 'Archived')
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <section id="learning-track" className="py-24 relative border-t border-[rgba(255,255,255,0.06)] bg-[#08090A]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col mb-12">
          <div className="font-mono text-xs text-[#FCEE0A] tracking-widest uppercase mb-2 flex items-center gap-2">
            <Compass className="w-3.5 h-3.5" />
            <span>04. GROWTH VECTOR</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F5F5F5] uppercase">
            What I'm Working On Now
          </h2>
          <p className="text-sm sm:text-base text-[#A0A4AC] mt-1 max-w-2xl">
            Active technical pursuits and deep learning tracks. Documented as rigorous directions of inquiry, not finished claims of mastery.
          </p>
        </div>

        {/* 3-Column Focus Areas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeTracks.map((track, idx) => (
            <div
              key={track.id}
              className="cyber-glass rounded-xl p-6 relative flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 border border-[rgba(255,255,255,0.08)] hover:border-[rgba(252,238,10,0.5)]"
            >
              {/* Corner tick */}
              <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-[#FCEE0A]/40 group-hover:border-[#FCEE0A]" />

              <div>
                {/* Header info */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-[#FCEE0A]">
                    TRACK // 0{idx + 1}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FCEE0A]/10 text-[#FCEE0A] border border-[#FCEE0A]/30">
                    {track.status || track.priority}
                  </span>
                </div>

                {/* Track Title */}
                <h3 className="text-xl font-bold text-[#F5F5F5] group-hover:text-[#FCEE0A] transition-colors mb-4 uppercase tracking-tight">
                  {track.title}
                </h3>

                {/* Focus Areas Bullet Items */}
                <ul className="space-y-2.5">
                  {track.focusAreas.map((area, areaIdx) => (
                    <li key={areaIdx} className="flex items-start gap-2.5 text-sm text-[#A0A4AC] leading-snug">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FCEE0A]/70 mt-1.5 shrink-0" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer status indicator */}
              <div className="mt-8 pt-4 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-[11px] font-mono text-[#A0A4AC]">
                <span className="flex items-center gap-1.5">
                  <Target className="w-3 h-3 text-[#FCEE0A]" />
                  <span>ACTIVE SPRINT</span>
                </span>
                <span className="text-[#F5F5F5] font-semibold">IN PROGRESS</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
