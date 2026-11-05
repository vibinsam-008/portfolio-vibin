import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { Menu, X, Github, Sliders, ExternalLink } from 'lucide-react';

interface NavbarProps {
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdmin }) => {
  const { data, isAdmin, isDraftMode } = usePortfolio();
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ['hero', 'about', 'projects', 'tech-stack', 'learning-track', 'contact'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180 && rect.bottom >= 180) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#hero', id: 'hero' },
    { label: 'About', href: '#about', id: 'about' },
    { label: 'Projects', href: '#projects', id: 'projects' },
    { label: 'Tech Stack', href: '#tech-stack', id: 'tech-stack' },
    { label: 'Learning Track', href: '#learning-track', id: 'learning-track' },
    { label: 'Contact', href: '#contact', id: 'contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const yOffset = -72;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 lg:px-8 pt-3 pb-2 transition-all duration-200">
        <div className={`max-w-7xl mx-auto flex items-center justify-between gap-6 px-4 sm:px-6 py-2.5 rounded-xl transition-all duration-300 ${
          scrolled 
            ? 'bg-[#111318]/90 backdrop-blur-md border border-[rgba(255,255,255,0.08)] shadow-[0_4px_30px_rgba(0,0,0,0.5)]' 
            : 'bg-[#111318]/60 backdrop-blur-sm border border-[rgba(255,255,255,0.04)]'
        }`}>
          
          {/* Zone 1: Brand Wordmark / VA Monogram */}
          <a 
            href="#hero" 
            onClick={(e) => handleNavClick(e, '#hero')}
            className="flex items-center gap-3 group whitespace-nowrap shrink-0 text-decoration-none"
          >
            <div className="w-9 h-9 flex items-center justify-center bg-[#08090A] border border-[#FCEE0A]/40 rounded-lg group-hover:border-[#FCEE0A] transition-colors relative overflow-hidden">
              <span className="font-mono text-sm font-bold text-[#FCEE0A] tracking-tighter">VA</span>
              <div className="absolute inset-0 bg-[#FCEE0A]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide text-[#F5F5F5] group-hover:text-[#FCEE0A] transition-colors">
                {data.identity.name}
              </span>
              <span className="font-mono text-[10px] text-[#A0A4AC] tracking-wider">
                MIT CHENNAI '30
              </span>
            </div>
          </a>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`px-3 py-1.5 text-xs font-medium tracking-wide whitespace-nowrap transition-all rounded-md relative ${
                    isActive 
                      ? 'text-[#FCEE0A] font-semibold' 
                      : 'text-[#A0A4AC] hover:text-[#F5F5F5]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#FCEE0A] rounded-full shadow-[0_0_8px_#FCEE0A]" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Actions (GitHub + Admin Dashboard) */}
          <div className="flex items-center gap-2.5 shrink-0">
            {data.contact.github && (
              <a
                href={data.contact.github}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#F5F5F5] hover:text-[#FCEE0A] bg-[#08090A]/80 hover:bg-[#08090A] border border-[rgba(255,255,255,0.08)] hover:border-[#FCEE0A]/40 rounded-lg transition-all"
                title="View GitHub Profile"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
                <ExternalLink className="w-2.5 h-2.5 text-[#A0A4AC]" />
              </a>
            )}

            <button
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all ${
                isAdmin 
                  ? 'bg-[#FCEE0A] text-[#08090A] font-bold shadow-[0_0_15px_rgba(252,238,10,0.3)] hover:bg-[#DFFF00]' 
                  : 'bg-[#161922] text-[#A0A4AC] hover:text-[#FCEE0A] border border-[rgba(255,255,255,0.08)] hover:border-[#FCEE0A]/40'
              }`}
              title="Open Portfolio Workspace Editor"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isAdmin ? (isDraftMode ? 'Previewing Draft' : 'Admin Panel') : 'Admin'}</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#A0A4AC] hover:text-[#F5F5F5] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#FCEE0A]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden bg-[#08090A]/95 backdrop-blur-lg pt-24 px-6 pb-8 flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <span className="font-mono text-xs text-[#FCEE0A] tracking-wider uppercase">Navigation</span>
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`text-lg font-medium py-2 px-3 rounded-lg transition-colors ${
                    activeSection === link.id
                      ? 'text-[#FCEE0A] bg-[#111318] border-l-2 border-[#FCEE0A]'
                      : 'text-[#A0A4AC] hover:text-[#F5F5F5]'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-[rgba(255,255,255,0.08)] flex flex-col gap-3">
            {data.contact.github && (
              <a
                href={data.contact.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 text-sm font-mono text-[#F5F5F5] bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-lg"
              >
                <Github className="w-4 h-4" />
                <span>Visit GitHub Profile</span>
              </a>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="flex items-center justify-center gap-2 py-2.5 text-sm font-mono font-semibold bg-[#FCEE0A] text-[#08090A] rounded-lg"
            >
              <Sliders className="w-4 h-4" />
              <span>{isAdmin ? 'Open Admin Dashboard' : 'Admin Login'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
