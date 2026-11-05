import React from 'react';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { CyberHudCanvas } from './CyberHudCanvas.tsx';
import { ArrowDown, Github, Linkedin, Terminal, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { data } = usePortfolio();
  const { identity, contact } = data;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -72;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative min-h-[92vh] pt-28 pb-16 flex items-center justify-center overflow-hidden cyber-grid-bg">
      {/* Top subtle ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#FCEE0A]/5 blur-[120px] pointer-events-none rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        
        {/* Availability Badge */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#111318] border border-[rgba(252,238,10,0.3)] shadow-[0_0_15px_rgba(252,238,10,0.08)] mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FCEE0A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FCEE0A]"></span>
          </span>
          <span className="font-mono text-[11px] font-medium tracking-wider text-[#FCEE0A] uppercase">
            {identity.availabilityStatus || 'Available for Meaningful Technical Collaboration'}
          </span>
        </div>

        {/* 2-Column Split: Typographic Core + Interactive 3D HUD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Headlines & Actions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start">
            
            {/* Identity Kicker */}
            <div className="font-mono text-xs sm:text-sm tracking-widest text-[#A0A4AC] uppercase mb-2">
              {identity.name} · <span className="text-[#FCEE0A]">{identity.role}</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5F5F5] uppercase leading-[1.08] mb-6">
              {identity.heroHeadlinePrimary}
              <br />
              <span className="text-[#FCEE0A] text-glow-yellow">
                {identity.heroHeadlineSecondary}
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-[#A0A4AC] leading-relaxed max-w-2xl mb-8 font-normal">
              {identity.heroBio}
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <button
                onClick={() => scrollToSection('projects')}
                className="px-6 py-3 text-sm font-semibold text-[#08090A] bg-[#FCEE0A] hover:bg-[#DFFF00] transition-all rounded-lg shadow-[0_0_20px_rgba(252,238,10,0.3)] flex items-center gap-2 group cursor-pointer"
              >
                <span>Explore My Projects</span>
                <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={() => scrollToSection('contact')}
                className="px-6 py-3 text-sm font-semibold text-[#F5F5F5] hover:text-[#FCEE0A] bg-[#111318] hover:bg-[#161922] border border-[rgba(255,255,255,0.12)] hover:border-[#FCEE0A]/50 transition-all rounded-lg cursor-pointer"
              >
                Contact Me
              </button>

              {/* Social Icon Links */}
              <div className="flex items-center gap-2 ml-1">
                {contact.github && (
                  <a
                    href={contact.github}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-[#111318] hover:bg-[#161922] border border-[rgba(255,255,255,0.1)] hover:border-[#FCEE0A]/40 rounded-lg text-[#A0A4AC] hover:text-[#FCEE0A] transition-colors"
                    title="GitHub Profile"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {contact.linkedin && (
                  <a
                    href={contact.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-[#111318] hover:bg-[#161922] border border-[rgba(255,255,255,0.1)] hover:border-[#FCEE0A]/40 rounded-lg text-[#A0A4AC] hover:text-[#FCEE0A] transition-colors"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Terminal-inspired Focus Panel */}
            <div className="w-full max-w-xl bg-[#08090A]/90 border border-[rgba(252,238,10,0.25)] rounded-lg p-4 font-mono text-xs shadow-[0_4px_24px_rgba(0,0,0,0.6)] relative overflow-hidden">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2 text-[#FCEE0A]">
                  <Terminal className="w-3.5 h-3.5" />
                  <span className="font-bold tracking-wider">ENGINEERING_CONSOLE // FOCUS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#FCEE0A]/40" />
                  <div className="w-2 h-2 rounded-full bg-[#FCEE0A]/70" />
                  <div className="w-2 h-2 rounded-full bg-[#FCEE0A]" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-[#F5F5F5]">
                {identity.terminalLines.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[#FCEE0A] font-bold">&gt;</span>
                    <span className={idx === 0 ? 'text-[#FCEE0A] font-semibold' : 'text-[#A0A4AC]'}>
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Three.js Interactive Wireframe HUD (5 cols) */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <div className="w-full aspect-square max-w-[420px] cyber-glass rounded-2xl relative overflow-hidden p-2">
              {/* Corner brackets */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#FCEE0A] pointer-events-none" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#FCEE0A] pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#FCEE0A] pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#FCEE0A] pointer-events-none" />

              {/* Three.js Canvas */}
              <CyberHudCanvas />

              {/* Minimal caption */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-[#A0A4AC] pointer-events-none bg-[#08090A]/70 px-2 py-1 rounded border border-[rgba(255,255,255,0.06)]">
                <span>INTERACTIVE THREE.JS ENGINE</span>
                <span className="text-[#FCEE0A]">DRAG TO ROTATE</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
