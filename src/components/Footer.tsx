import React from 'react';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { Sliders, ArrowUp } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const { data, isAdmin } = usePortfolio();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[rgba(255,255,255,0.08)] bg-[#08090A] py-12 relative text-[#A0A4AC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[rgba(255,255,255,0.06)]">
          {/* Brand & Affiliation */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="font-extrabold text-base tracking-tight text-[#F5F5F5] uppercase">
              {data.identity.name}
            </span>
            <span className="font-mono text-xs text-[#A0A4AC] mt-0.5">
              Madras Institute of Technology, Chennai · Class of {data.identity.graduationYear}
            </span>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono">
            <a href="#hero" className="hover:text-[#FCEE0A] transition-colors">Home</a>
            <a href="#about" className="hover:text-[#FCEE0A] transition-colors">About</a>
            <a href="#projects" className="hover:text-[#FCEE0A] transition-colors">Projects</a>
            <a href="#tech-stack" className="hover:text-[#FCEE0A] transition-colors">Tech Stack</a>
            <a href="#learning-track" className="hover:text-[#FCEE0A] transition-colors">Learning Track</a>
            <a href="#contact" className="hover:text-[#FCEE0A] transition-colors">Contact</a>
          </div>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111318] hover:bg-[#161922] border border-[rgba(255,255,255,0.08)] hover:border-[#FCEE0A]/40 text-xs font-mono text-[#F5F5F5] transition-all cursor-pointer"
          >
            <span>Top</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#FCEE0A]" />
          </button>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="text-center sm:text-left">
            © {new Date().getFullYear()} Vibin Apapchi A. Built with engineering rigor and first principles.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 text-xs text-[#A0A4AC] hover:text-[#FCEE0A] transition-colors cursor-pointer"
            >
              <Sliders className="w-3 h-3" />
              <span>{isAdmin ? 'Admin Console (Authorized)' : 'Admin Dashboard'}</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
