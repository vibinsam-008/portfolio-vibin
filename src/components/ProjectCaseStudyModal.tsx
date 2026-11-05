import React, { useEffect } from 'react';
import { Project } from '../types/portfolio.ts';
import { X, ExternalLink, Github, Layers, AlertTriangle, CheckCircle2, Lightbulb, Compass, Code, Terminal, Clock } from 'lucide-react';

interface ProjectCaseStudyModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectCaseStudyModal: React.FC<ProjectCaseStudyModalProps> = ({ project, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const { caseStudy } = project;

  const statusColors: Record<string, string> = {
    'Concept': 'text-amber-400 border-amber-400/40 bg-amber-400/10',
    'In Progress': 'text-[#FCEE0A] border-[#FCEE0A]/40 bg-[#FCEE0A]/10',
    'Prototype': 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10',
    'Deployed': 'text-cyan-400 border-cyan-400/40 bg-cyan-400/10',
    'Archived': 'text-zinc-400 border-zinc-400/40 bg-zinc-400/10',
  };

  const sections = [
    { title: '01. Problem Statement', content: caseStudy?.problemStatement, icon: <AlertTriangle className="w-4 h-4 text-[#FCEE0A]" /> },
    { title: '02. Intended Users', content: caseStudy?.intendedUsers, icon: <Compass className="w-4 h-4 text-[#FCEE0A]" /> },
    { title: '03. Why The Problem Matters', content: caseStudy?.whyItMatters, icon: <Lightbulb className="w-4 h-4 text-[#FCEE0A]" /> },
    { title: '04. System Architecture', content: caseStudy?.systemArchitecture, icon: <Layers className="w-4 h-4 text-[#FCEE0A]" /> },
    { title: '05. Technical Decisions & Trade-Offs', content: caseStudy?.decisionsAndTradeoffs, icon: <Terminal className="w-4 h-4 text-[#FCEE0A]" /> },
    { title: '06. Implementation Details', content: caseStudy?.implementationDetails, icon: <Code className="w-4 h-4 text-[#FCEE0A]" /> },
    { title: '07. Challenges & Debugging', content: caseStudy?.challengesAndDebugging, icon: <AlertTriangle className="w-4 h-4 text-amber-400" /> },
    { title: '08. Current Limitations', content: caseStudy?.currentLimitations, icon: <Clock className="w-4 h-4 text-amber-400" /> },
    { title: '09. Validation & Results', content: caseStudy?.validationAndResults, icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> },
    { title: '10. Future Improvements', content: caseStudy?.futureImprovements, icon: <Lightbulb className="w-4 h-4 text-cyan-400" /> },
  ].filter(sec => Boolean(sec.content && sec.content.trim().length > 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#08090A]/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-[#111318] border border-[rgba(252,238,10,0.35)] rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-[rgba(255,255,255,0.08)] bg-[#08090A]/60 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-medium border ${statusColors[project.status] || 'text-[#A0A4AC]'}`}>
                {project.status.toUpperCase()}
              </span>
              <span className="text-xs font-mono text-[#A0A4AC]">
                CATEGORY: <span className="text-[#F5F5F5] font-semibold">{project.category}</span>
              </span>
              {project.lastUpdated && (
                <span className="text-xs font-mono text-[#A0A4AC]">
                  UPDATED: {project.lastUpdated}
                </span>
              )}
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] uppercase tracking-tight">
              {project.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#A0A4AC] hover:text-[#FCEE0A] hover:bg-[#161922] rounded-lg border border-[rgba(255,255,255,0.08)] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Cover Image & Metadata */}
          {project.coverImage && (
            <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-[rgba(255,255,255,0.08)] bg-[#08090A]">
              <img
                src={project.coverImage}
                alt={project.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-transparent to-transparent opacity-60" />
            </div>
          )}

          {/* Short Description */}
          <div className="p-4 rounded-xl bg-[#08090A]/70 border border-[rgba(255,255,255,0.06)]">
            <div className="font-mono text-xs text-[#FCEE0A] uppercase tracking-wider mb-1">
              SYSTEM_BRIEF
            </div>
            <p className="text-base text-[#F5F5F5] leading-relaxed">
              {project.shortDescription}
            </p>
          </div>

          {/* Tech Stack Chips */}
          <div>
            <div className="font-mono text-xs text-[#A0A4AC] uppercase tracking-wider mb-2">
              TECHNOLOGY_PIPELINE
            </div>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-mono bg-[#161922] text-[#F5F5F5] border border-[rgba(255,255,255,0.08)] rounded-md"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Structured Case Study Sections */}
          <div className="space-y-4 pt-4 border-t border-[rgba(255,255,255,0.08)]">
            <div className="font-mono text-xs text-[#FCEE0A] uppercase tracking-widest">
              DETAILED TECHNICAL SPECIFICATIONS
            </div>

            {sections.length === 0 ? (
              <p className="text-sm text-[#A0A4AC] italic">
                Detailed case-study documentation will be updated as this engineering project progresses.
              </p>
            ) : (
              sections.map((section, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#08090A]/50 border border-[rgba(255,255,255,0.06)] hover:border-[rgba(252,238,10,0.25)] transition-colors"
                >
                  <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#FCEE0A] uppercase tracking-wider mb-2">
                    {section.icon}
                    <span>{section.title}</span>
                  </div>
                  <p className="text-sm text-[#A0A4AC] leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Modal Footer Links */}
        <div className="p-4 px-6 border-t border-[rgba(255,255,255,0.08)] bg-[#08090A]/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-medium text-[#F5F5F5] hover:text-[#08090A] bg-[#161922] hover:bg-[#FCEE0A] border border-[rgba(255,255,255,0.1)] rounded-lg transition-all"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Source Code</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
              </a>
            )}

            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-medium text-[#08090A] bg-[#FCEE0A] hover:bg-[#DFFF00] rounded-lg transition-all"
              >
                <span>Live Demo</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono text-[#A0A4AC] hover:text-[#F5F5F5]"
          >
            Close [ESC]
          </button>
        </div>

      </div>
    </div>
  );
};
