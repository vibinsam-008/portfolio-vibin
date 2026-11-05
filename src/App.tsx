import React, { useState, useEffect } from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { ProjectGallery } from './components/ProjectGallery.tsx';
import { TechStackSection } from './components/TechStackSection.tsx';
import { LearningTrackSection } from './components/LearningTrackSection.tsx';
import { EngineeringPrinciplesSection } from './components/EngineeringPrinciplesSection.tsx';
import { ContactSection } from './components/ContactSection.tsx';
import { Footer } from './components/Footer.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { Sliders, Save, RotateCcw, AlertTriangle } from 'lucide-react';

const PortfolioContent: React.FC = () => {
  const { isDraftMode, saveAndPublish, discardDraft } = usePortfolio();
  const [adminOpen, setAdminOpen] = useState(false);
  const [savingLive, setSavingLive] = useState(false);

  // Check URL path or hash for /admin on load or popstate
  useEffect(() => {
    const checkAdminPath = () => {
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        setAdminOpen(true);
      }
    };
    checkAdminPath();
    window.addEventListener('popstate', checkAdminPath);
    return () => window.removeEventListener('popstate', checkAdminPath);
  }, []);

  const handleOpenAdmin = () => {
    setAdminOpen(true);
  };

  const handleCloseAdmin = () => {
    setAdminOpen(false);
    if (window.location.pathname === '/admin') {
      window.history.pushState({}, '', '/');
    }
  };

  const handleLiveSave = async () => {
    setSavingLive(true);
    await saveAndPublish();
    setSavingLive(false);
  };

  return (
    <div className="min-h-screen bg-[#08090A] text-[#F5F5F5] relative flex flex-col font-sans selection:bg-[#FCEE0A] selection:text-[#08090A]">
      
      {/* Draft Preview Persistent Floating Banner */}
      {isDraftMode && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-xl bg-[#111318]/95 border border-[#FCEE0A] backdrop-blur-md shadow-[0_0_30px_rgba(252,238,10,0.25)] flex items-center gap-4 text-xs font-mono max-w-xl w-[92%] sm:w-auto justify-between">
          <div className="flex items-center gap-2 text-[#FCEE0A]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-bold">PREVIEWING DRAFT</span>
            <span className="hidden sm:inline text-[#A0A4AC]">(Not yet live to visitors)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={discardDraft}
              className="px-2.5 py-1 rounded bg-[#161922] hover:bg-[#22262E] text-[#A0A4AC] hover:text-[#F5F5F5] transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleLiveSave}
              disabled={savingLive}
              className="px-3 py-1 rounded bg-[#FCEE0A] hover:bg-[#DFFF00] text-[#08090A] font-bold transition-all shadow-[0_0_12px_rgba(252,238,10,0.3)]"
            >
              {savingLive ? 'Publishing...' : 'Publish Live'}
            </button>
          </div>
        </div>
      )}

      {/* Floating Glass Navigation */}
      <Navbar onOpenAdmin={handleOpenAdmin} />

      {/* Main Content Sections */}
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <ProjectGallery />
        <TechStackSection />
        <LearningTrackSection />
        <EngineeringPrinciplesSection />
        <ContactSection />
      </main>

      {/* Restrained Cyberpunk Footer */}
      <Footer onOpenAdmin={handleOpenAdmin} />

      {/* Full-Feature Admin Workspace Overlay */}
      <AdminDashboard isOpen={adminOpen} onClose={handleCloseAdmin} />
      
    </div>
  );
};

export default function App() {
  return (
    <PortfolioProvider>
      <PortfolioContent />
    </PortfolioProvider>
  );
}
