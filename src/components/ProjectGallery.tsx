import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext.tsx';
import { ProjectCard } from './ProjectCard.tsx';
import { ProjectCaseStudyModal } from './ProjectCaseStudyModal.tsx';
import { Project } from '../types/portfolio.ts';
import { Filter, Sparkles } from 'lucide-react';

export const ProjectGallery: React.FC = () => {
  const { data } = usePortfolio();
  const { projects, visibility } = data;
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeCaseStudyProject, setActiveCaseStudyProject] = useState<Project | null>(null);

  if (visibility.projects === false) return null;

  // Derive dynamic categories from project data
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [projects]);

  // Filter projects (sorted by order or featured)
  const filteredProjects = useMemo(() => {
    let list = [...projects];
    if (selectedCategory !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [projects, selectedCategory]);

  return (
    <section id="projects" className="py-24 relative border-t border-[rgba(255,255,255,0.06)] bg-[#08090A]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="font-mono text-xs text-[#FCEE0A] tracking-widest uppercase mb-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>02. TECHNICAL ARTIFACTS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F5F5F5] uppercase">
              Featured Projects
            </h2>
            <p className="text-sm sm:text-base text-[#A0A4AC] mt-1 max-w-xl">
              Real-world engineering tools, campus systems, and exploratory prototypes built from first principles.
            </p>
          </div>

          {/* Interactive Category Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-xl overflow-x-auto max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#FCEE0A] text-[#08090A] font-bold shadow-[0_0_12px_rgba(252,238,10,0.3)]'
                    : 'text-[#A0A4AC] hover:text-[#F5F5F5] hover:bg-[#161922]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Project Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 cyber-glass rounded-2xl p-8">
            <Filter className="w-8 h-8 text-[#A0A4AC] mx-auto mb-3" />
            <div className="font-mono text-sm text-[#F5F5F5]">NO PROJECTS IN THIS CATEGORY</div>
            <p className="text-xs text-[#A0A4AC] mt-1">Select another filter or add projects via the admin dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpenCaseStudy={setActiveCaseStudyProject}
              />
            ))}
          </div>
        )}

      </div>

      {/* Case Study Modal */}
      <ProjectCaseStudyModal
        project={activeCaseStudyProject}
        onClose={() => setActiveCaseStudyProject(null)}
      />
    </section>
  );
};
