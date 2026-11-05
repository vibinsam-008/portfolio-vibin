import React, { useState } from 'react';
import { Project } from '../types/portfolio.ts';
import { ExternalLink, Github, FileText, Calendar, Code2 } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onOpenCaseStudy: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpenCaseStudy }) => {
  const [imgError, setImgError] = useState(false);

  const statusColors: Record<string, string> = {
    'Concept': 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    'In Progress': 'text-[#FCEE0A] border-[#FCEE0A]/40 bg-[#FCEE0A]/10',
    'Prototype': 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
    'Deployed': 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
    'Archived': 'text-zinc-400 border-zinc-400/30 bg-zinc-400/10',
  };

  return (
    <div className="cyber-glass rounded-xl overflow-hidden flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300 relative border border-[rgba(255,255,255,0.08)] hover:border-[rgba(252,238,10,0.5)]">
      
      {/* Corner cut accent */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#FCEE0A]/60 group-hover:border-[#FCEE0A]" />
      </div>

      <div>
        {/* Cover Image / Visual Canvas */}
        <div className="relative w-full h-52 sm:h-56 bg-[#08090A] overflow-hidden border-b border-[rgba(255,255,255,0.06)]">
          {project.coverImage && !imgError ? (
            <img
              src={project.coverImage}
              alt={project.title}
              onError={() => setImgError(true)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#111318] to-[#08090A]">
              <Code2 className="w-10 h-10 text-[#FCEE0A]/60 mb-2" />
              <span className="font-mono text-xs text-[#A0A4AC] tracking-wider uppercase">
                {project.category}
              </span>
            </div>
          )}

          {/* Scrim Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-transparent to-transparent opacity-80" />

          {/* Status & Category on Top of Image */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-medium border ${statusColors[project.status] || 'text-[#A0A4AC]'}`}>
              {project.status.toUpperCase()}
            </span>
            <span className="text-[11px] font-mono text-[#F5F5F5] bg-[#08090A]/85 backdrop-blur-sm px-2 py-0.5 rounded border border-[rgba(255,255,255,0.08)]">
              {project.category}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          
          {/* Title */}
          <h3 className="text-xl font-bold text-[#F5F5F5] group-hover:text-[#FCEE0A] transition-colors uppercase tracking-tight mb-2">
            {project.title}
          </h3>

          {/* Short Description */}
          <p className="text-sm text-[#A0A4AC] leading-relaxed line-clamp-3 mb-4">
            {project.shortDescription}
          </p>

          {/* Tech Stack Unboxed Metadata */}
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            {project.techStack.slice(0, 4).map((tech, idx) => (
              <span
                key={idx}
                className="text-xs font-mono text-[#F5F5F5] bg-[#08090A] px-2 py-0.5 rounded border border-[rgba(255,255,255,0.08)]"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 4 && (
              <span className="text-[11px] font-mono text-[#A0A4AC] px-1">
                +{project.techStack.length - 4} more
              </span>
            )}
          </div>

          {/* Timestamps */}
          {(project.startDate || project.lastUpdated) && (
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#A0A4AC] mb-2">
              <Calendar className="w-3 h-3 text-[#FCEE0A]" />
              <span>
                {project.startDate && `Started ${project.startDate}`}
                {project.startDate && project.lastUpdated && ' · '}
                {project.lastUpdated && `Updated ${project.lastUpdated}`}
              </span>
            </div>
          )}

        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 pt-0 mt-2 flex items-center justify-between gap-2 border-t border-[rgba(255,255,255,0.06)] pt-4">
        <button
          onClick={() => onOpenCaseStudy(project)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-[#FCEE0A] hover:text-[#08090A] bg-[#FCEE0A]/10 hover:bg-[#FCEE0A] border border-[rgba(252,238,10,0.3)] rounded-lg transition-all cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Case Study</span>
        </button>

        <div className="flex items-center gap-2">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-[#A0A4AC] hover:text-[#FCEE0A] hover:bg-[#08090A] border border-[rgba(255,255,255,0.08)] hover:border-[#FCEE0A]/40 rounded-lg transition-colors"
              title="View Repository"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-[#A0A4AC] hover:text-[#FCEE0A] hover:bg-[#08090A] border border-[rgba(255,255,255,0.08)] hover:border-[#FCEE0A]/40 rounded-lg transition-colors"
              title="Live Demo"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

    </div>
  );
};
