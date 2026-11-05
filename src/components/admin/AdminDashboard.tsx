import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext.tsx';
import { Project, ProjectStatus, TechCategory, TechProficiency, LearningTrackItem, TechStackItem } from '../../types/portfolio.ts';
import { 
  X, Lock, Key, Save, Eye, EyeOff, RotateCcw, Plus, Trash2, Edit3, 
  Upload, Check, AlertCircle, ArrowUp, ArrowDown, Star, MessageSquare, 
  Terminal, Layers, Sliders, Shield, LogOut, ExternalLink, Image as ImageIcon
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const { 
    data, 
    isAdmin, 
    adminEmail, 
    isDraftMode, 
    inquiries,
    login, 
    logout, 
    updateDraft, 
    saveAndPublish, 
    discardDraft, 
    uploadImage, 
    toggleInquiryRead, 
    deleteInquiry,
    setupAdminAccount 
  } = usePortfolio();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'projects' | 'identity' | 'tech' | 'tracks' | 'principles' | 'contact' | 'visibility' | 'inquiries' | 'security'>('projects');

  // Auth form state
  const [emailInput, setEmailInput] = useState(adminEmail || 'vibinappachi@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Status message
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Project editing modal state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // New Tech State
  const [newTechName, setNewTechName] = useState('');
  const [newTechCategory, setNewTechCategory] = useState<TechCategory>('Languages');
  const [newTechLevel, setNewTechLevel] = useState<TechProficiency>('Building with');

  // Password reset state inside security
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState(adminEmail || 'vibinappachi@gmail.com');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    const res = await login(passwordInput, emailInput);
    setAuthLoading(false);
    if (!res.success) {
      setAuthError(res.error || 'Authentication rejected. Verify credentials.');
    } else {
      setPasswordInput('');
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handlePublish = async () => {
    setSaving(true);
    const res = await saveAndPublish();
    setSaving(false);
    if (res.success) {
      showNotification('success', 'Changes published live to server successfully!');
    } else {
      showNotification('error', res.error || 'Failed to publish changes');
    }
  };

  const handleDiscard = () => {
    if (window.confirm('Discard all unsaved draft changes?')) {
      discardDraft();
      showNotification('success', 'Draft changes reverted to saved server state.');
    }
  };

  // ================= PROJECT HELPERS =================
  const handleOpenAddProject = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: 'New Engineering Project',
      shortDescription: 'Brief description of the engineering project and technical approach.',
      category: 'Engineering Tools',
      status: 'Prototype',
      techStack: ['TypeScript', 'WebGL'],
      coverImage: '',
      githubUrl: 'https://github.com/vibinapapchi',
      demoUrl: '',
      startDate: new Date().toISOString().slice(0, 7),
      lastUpdated: new Date().toISOString().slice(0, 7),
      featured: true,
      order: data.projects.length + 1,
      caseStudy: {
        problemStatement: '',
        intendedUsers: '',
        whyItMatters: '',
        systemArchitecture: '',
        decisionsAndTradeoffs: '',
        implementationDetails: '',
        challengesAndDebugging: '',
        currentLimitations: '',
        validationAndResults: '',
        futureImprovements: ''
      }
    };
    setEditingProject(newProj);
    setIsNewProject(true);
  };

  const handleSaveProjectModal = () => {
    if (!editingProject) return;
    updateDraft((prev) => {
      let updatedProjects = [...prev.projects];
      if (isNewProject) {
        updatedProjects.push(editingProject);
      } else {
        updatedProjects = updatedProjects.map(p => p.id === editingProject.id ? editingProject : p);
      }
      return { ...prev, projects: updatedProjects };
    });
    setEditingProject(null);
    showNotification('success', 'Project updated in draft.');
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      updateDraft(prev => ({
        ...prev,
        projects: prev.projects.filter(p => p.id !== id)
      }));
      showNotification('success', 'Project removed from draft.');
    }
  };

  const handleToggleFeatured = (id: string) => {
    updateDraft(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, featured: !p.featured } : p)
    }));
  };

  const handleMoveProject = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= data.projects.length) return;
    updateDraft(prev => {
      const projs = [...prev.projects];
      const temp = projs[index];
      projs[index] = projs[targetIdx];
      projs[targetIdx] = temp;
      projs.forEach((p, idx) => p.order = idx + 1);
      return { ...prev, projects: projs };
    });
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;
    setUploadingImage(true);
    const res = await uploadImage(file);
    setUploadingImage(false);
    if (res.success && res.url) {
      setEditingProject({ ...editingProject, coverImage: res.url });
      showNotification('success', 'Image uploaded successfully!');
    } else {
      showNotification('error', res.error || 'Failed to upload image');
    }
  };

  // ================= TECH STACK HELPERS =================
  const handleAddTech = () => {
    if (!newTechName.trim()) return;
    const newItem: TechStackItem = {
      id: `tech-${Date.now()}`,
      name: newTechName.trim(),
      category: newTechCategory,
      level: newTechLevel,
      order: data.techStack.length + 1
    };
    updateDraft(prev => ({
      ...prev,
      techStack: [...prev.techStack, newItem]
    }));
    setNewTechName('');
    showNotification('success', `Added ${newItem.name}`);
  };

  const handleDeleteTech = (id: string) => {
    updateDraft(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t.id !== id)
    }));
  };

  // ================= LEARNING TRACK HELPERS =================
  const handleAddLearningTrack = () => {
    const newTrack: LearningTrackItem = {
      id: `track-${Date.now()}`,
      title: 'New Technical Focus',
      focusAreas: ['Core architectural concept', 'Practical system implementation'],
      priority: 'Active',
      status: 'Active Sprint',
      order: data.learningTracks.length + 1
    };
    updateDraft(prev => ({
      ...prev,
      learningTracks: [...prev.learningTracks, newTrack]
    }));
    showNotification('success', 'New learning track added');
  };

  const handleDeleteTrack = (id: string) => {
    updateDraft(prev => ({
      ...prev,
      learningTracks: prev.learningTracks.filter(t => t.id !== id)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-[#08090A]/90 backdrop-blur-lg overflow-y-auto">
      <div 
        className="relative w-full max-w-6xl bg-[#111318] border border-[rgba(252,238,10,0.4)] rounded-2xl shadow-[0_12px_60px_rgba(0,0,0,0.9)] overflow-hidden my-auto max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-[rgba(255,255,255,0.08)] bg-[#08090A] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#161922] border border-[#FCEE0A]/40 flex items-center justify-center text-[#FCEE0A]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#F5F5F5] uppercase tracking-wide">
                  Portfolio Workspace Engine
                </h2>
                {isDraftMode && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-400/20 text-amber-400 border border-amber-400/40">
                    UNSAVED DRAFT
                  </span>
                )}
              </div>
              <div className="font-mono text-[11px] text-[#A0A4AC]">
                {isAdmin ? `Authorized as ${adminEmail || 'Admin'}` : 'Restricted Access'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                {isDraftMode && (
                  <button
                    onClick={handleDiscard}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#A0A4AC] hover:text-[#F5F5F5] bg-[#161922] rounded-lg transition-colors cursor-pointer"
                    title="Discard Unsaved Changes"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Discard</span>
                  </button>
                )}

                <button
                  onClick={handlePublish}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono font-bold bg-[#FCEE0A] hover:bg-[#DFFF00] text-[#08090A] rounded-lg shadow-[0_0_15px_rgba(252,238,10,0.3)] transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save & Publish Live'}</span>
                </button>

                <button
                  onClick={logout}
                  className="p-2 text-[#A0A4AC] hover:text-red-400 hover:bg-[#161922] rounded-lg transition-colors ml-1"
                  title="Logout Admin Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 text-[#A0A4AC] hover:text-[#FCEE0A] hover:bg-[#161922] rounded-lg transition-colors ml-2"
              aria-label="Close dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div className={`px-6 py-2 text-xs font-mono flex items-center gap-2 shrink-0 ${
            feedback.type === 'success' 
              ? 'bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300' 
              : 'bg-red-950/80 border-b border-red-500/40 text-red-300'
          }`}>
            {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Not Authenticated: Secure Login Form */}
        {!isAdmin ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center max-w-md mx-auto my-auto w-full">
            <div className="w-12 h-12 rounded-xl bg-[#08090A] border border-[#FCEE0A]/40 flex items-center justify-center text-[#FCEE0A] mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#F5F5F5] uppercase mb-1">
              Admin Authentication
            </h3>
            <p className="text-xs text-[#A0A4AC] text-center mb-6 font-mono">
              Enter administrator password to unlock content modification privileges.
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div>
                <label className="block font-mono text-xs text-[#A0A4AC] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] focus:border-[#FCEE0A] text-[#F5F5F5] font-mono text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-[#A0A4AC] mb-1">
                  Admin Master Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] focus:border-[#FCEE0A] text-[#F5F5F5] font-mono text-xs focus:outline-none"
                  required
                  autoFocus
                />
              </div>

              {authError && (
                <div className="p-3 rounded-lg text-xs font-mono bg-red-950/60 border border-red-500/50 text-red-300">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 px-4 rounded-lg bg-[#FCEE0A] hover:bg-[#DFFF00] text-[#08090A] font-bold font-mono text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
              >
                {authLoading ? 'Verifying Token...' : 'Authenticate & Unlock'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)] text-center w-full">
              <span className="font-mono text-[11px] text-[#A0A4AC]">
                Default setup credentials configured for Vibin Apapchi A (vibinappachi@gmail.com). Initial password: <span className="text-[#FCEE0A]">vibin2030</span>.
              </span>
            </div>
          </div>
        ) : (
          /* Authenticated Admin Workspace */
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            
            {/* Tab Sidebar */}
            <div className="w-full md:w-56 bg-[#08090A]/70 border-r border-[rgba(255,255,255,0.08)] p-3 flex md:flex-col gap-1 overflow-x-auto shrink-0 font-mono text-xs">
              <button
                onClick={() => setActiveTab('projects')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'projects' ? 'bg-[#FCEE0A] text-[#08090A] font-bold' : 'text-[#A0A4AC] hover:text-[#F5F5F5] hover:bg-[#161922]'
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>Projects ({data.projects.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('identity')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'identity' ? 'bg-[#FCEE0A] text-[#08090A] font-bold' : 'text-[#A0A4AC] hover:text-[#F5F5F5] hover:bg-[#161922]'
                }`}
              >
                <Terminal className="w-4 h-4 shrink-0" />
                <span>Identity & Bio</span>
              </button>

              <button
                onClick={() => setActiveTab('tech')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'tech' ? 'bg-[#FCEE0A] text-[#08090A] font-bold' : 'text-[#A0A4AC] hover:text-[#F5F5F5] hover:bg-[#161922]'
                }`}
              >
                <Sliders className="w-4 h-4 shrink-0" />
                <span>Tech Stack ({data.techStack.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('tracks')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'tracks' ? 'bg-[#FCEE0A] text-[#08090A] font-bold' : 'text-[#A0A4AC] hover:text-[#F5F5F5] hover:bg-[#161922]'
                }`}
              >
                <ArrowUp className="w-4 h-4 shrink-0" />
                <span>Learning Tracks</span>
              </button>

              <button
                onClick={() => setActiveTab('principles')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'principles' ? 'bg-[#FCEE0A] text-[#08090A] font-bold' : 'text-[#A0A4AC] hover:text-[#F5F5F5] hover:bg-[#161922]'
                }`}
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span>Principles</span>
              </button>

              <button
                onClick={() => setActiveTab('contact')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'contact' ? 'bg-[#FCEE0A] text-[#08090A] font-bold' : 'text-[#A0A4AC] hover:text-[#F5F5F5] hover:bg-[#161922]'
                }`}
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span>Contact & Links</span>
              </button>

              <button
                onClick={() => setActiveTab('visibility')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'visibility' ? 'bg-[#FCEE0A] text-[#08090A] font-bold' : 'text-[#A0A4AC] hover:text-[#F5F5F5] hover:bg-[#161922]'
                }`}
              >
                <Eye className="w-4 h-4 shrink-0" />
                <span>Section Visibility</span>
              </button>

              <button
                onClick={() => setActiveTab('inquiries')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'inquiries' ? 'bg-[#FCEE0A] text-[#08090A] font-bold' : 'text-[#A0A4AC] hover:text-[#F5F5F5] hover:bg-[#161922]'
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Inquiries ({inquiries.filter(i => !i.read).length})</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'security' ? 'bg-[#FCEE0A] text-[#08090A] font-bold' : 'text-[#A0A4AC] hover:text-[#F5F5F5] hover:bg-[#161922]'
                }`}
              >
                <Key className="w-4 h-4 shrink-0" />
                <span>Security</span>
              </button>
            </div>

            {/* Tab Content Panel */}
            <div className="flex-1 p-6 overflow-y-auto">
              
              {/* TAB 1: PROJECTS */}
              {activeTab === 'projects' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.08)]">
                    <div>
                      <h3 className="text-lg font-bold text-[#F5F5F5] uppercase">
                        Project Repository Manager
                      </h3>
                      <p className="text-xs font-mono text-[#A0A4AC]">
                        Add, reorder, feature, and edit technical case studies.
                      </p>
                    </div>

                    <button
                      onClick={handleOpenAddProject}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold bg-[#FCEE0A] text-[#08090A] rounded-lg hover:bg-[#DFFF00] transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Project</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {data.projects.map((proj, idx) => (
                      <div
                        key={proj.id}
                        className="p-4 rounded-xl bg-[#08090A] border border-[rgba(255,255,255,0.06)] hover:border-[#FCEE0A]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {/* Featured star toggle */}
                          <button
                            onClick={() => handleToggleFeatured(proj.id)}
                            className={`p-1.5 rounded transition-colors ${
                              proj.featured ? 'text-[#FCEE0A]' : 'text-[#A0A4AC] hover:text-[#F5F5F5]'
                            }`}
                            title={proj.featured ? 'Featured Project' : 'Mark as Featured'}
                          >
                            <Star className={`w-4 h-4 ${proj.featured ? 'fill-[#FCEE0A]' : ''}`} />
                          </button>

                          {/* Thumbnail */}
                          <div className="w-12 h-12 rounded-lg bg-[#161922] overflow-hidden shrink-0 border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
                            {proj.coverImage ? (
                              <img src={proj.coverImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-[#A0A4AC]" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-[#F5F5F5]">
                                {proj.title}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161922] text-[#FCEE0A] border border-[rgba(255,255,255,0.08)]">
                                {proj.category}
                              </span>
                              <span className="text-[10px] font-mono text-[#A0A4AC]">
                                [{proj.status}]
                              </span>
                            </div>
                            <p className="text-xs text-[#A0A4AC] line-clamp-1 mt-0.5 max-w-md">
                              {proj.shortDescription}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => handleMoveProject(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 rounded bg-[#161922] text-[#A0A4AC] hover:text-[#F5F5F5] disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveProject(idx, 'down')}
                            disabled={idx === data.projects.length - 1}
                            className="p-1.5 rounded bg-[#161922] text-[#A0A4AC] hover:text-[#F5F5F5] disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingProject(proj);
                              setIsNewProject(false);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono rounded bg-[#161922] hover:bg-[#FCEE0A] text-[#F5F5F5] hover:text-[#08090A] transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDeleteProject(proj.id)}
                            className="p-1.5 rounded bg-[#161922] hover:bg-red-950 text-[#A0A4AC] hover:text-red-400 transition-colors"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: IDENTITY & BIO */}
              {activeTab === 'identity' && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-[rgba(255,255,255,0.08)]">
                    <h3 className="text-lg font-bold text-[#F5F5F5] uppercase">
                      Identity & Personal Specification
                    </h3>
                    <p className="text-xs font-mono text-[#A0A4AC]">
                      Update name, role, availability status, headlines, and terminal lines.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs text-[#A0A4AC] mb-1">Full Name</label>
                      <input
                        type="text"
                        value={data.identity.name}
                        onChange={(e) => updateDraft(prev => ({
                          ...prev,
                          identity: { ...prev.identity, name: e.target.value }
                        }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] focus:border-[#FCEE0A] text-[#F5F5F5] text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-[#A0A4AC] mb-1">Academic Role</label>
                      <input
                        type="text"
                        value={data.identity.role}
                        onChange={(e) => updateDraft(prev => ({
                          ...prev,
                          identity: { ...prev.identity, role: e.target.value }
                        }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] focus:border-[#FCEE0A] text-[#F5F5F5] text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-[#A0A4AC] mb-1">Graduation Year</label>
                      <input
                        type="text"
                        value={data.identity.graduationYear}
                        onChange={(e) => updateDraft(prev => ({
                          ...prev,
                          identity: { ...prev.identity, graduationYear: e.target.value }
                        }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] focus:border-[#FCEE0A] text-[#F5F5F5] text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-[#A0A4AC] mb-1">Availability Status</label>
                      <input
                        type="text"
                        value={data.identity.availabilityStatus}
                        onChange={(e) => updateDraft(prev => ({
                          ...prev,
                          identity: { ...prev.identity, availabilityStatus: e.target.value }
                        }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] focus:border-[#FCEE0A] text-[#F5F5F5] text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-[#A0A4AC] mb-1">Hero Headline 1</label>
                      <input
                        type="text"
                        value={data.identity.heroHeadlinePrimary}
                        onChange={(e) => updateDraft(prev => ({
                          ...prev,
                          identity: { ...prev.identity, heroHeadlinePrimary: e.target.value }
                        }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] focus:border-[#FCEE0A] text-[#F5F5F5] text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-[#A0A4AC] mb-1">Hero Headline 2 (Yellow Glow)</label>
                      <input
                        type="text"
                        value={data.identity.heroHeadlineSecondary}
                        onChange={(e) => updateDraft(prev => ({
                          ...prev,
                          identity: { ...prev.identity, heroHeadlineSecondary: e.target.value }
                        }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] focus:border-[#FCEE0A] text-[#F5F5F5] text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-[#A0A4AC] mb-1">Hero Supporting Bio</label>
                    <textarea
                      rows={3}
                      value={data.identity.heroBio}
                      onChange={(e) => updateDraft(prev => ({
                        ...prev,
                        identity: { ...prev.identity, heroBio: e.target.value }
                      }))}
                      className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] focus:border-[#FCEE0A] text-[#F5F5F5] text-xs font-sans resize-none"
                    />
                  </div>

                  {/* Terminal Focus Lines */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-mono text-xs text-[#FCEE0A]">Terminal Console Focus Lines</label>
                      <button
                        onClick={() => updateDraft(prev => ({
                          ...prev,
                          identity: { ...prev.identity, terminalLines: [...prev.identity.terminalLines, 'NEW FOCUS ITEM'] }
                        }))}
                        className="text-[11px] font-mono text-[#FCEE0A] hover:underline cursor-pointer"
                      >
                        + Add Terminal Line
                      </button>
                    </div>

                    <div className="space-y-2">
                      {data.identity.terminalLines.map((line, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="font-mono text-xs text-[#FCEE0A]">&gt;</span>
                          <input
                            type="text"
                            value={line}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDraft(prev => {
                                const lines = [...prev.identity.terminalLines];
                                lines[idx] = val;
                                return { ...prev, identity: { ...prev.identity, terminalLines: lines } };
                              });
                            }}
                            className="flex-1 px-3 py-1.5 rounded bg-[#08090A] border border-[rgba(255,255,255,0.08)] text-[#F5F5F5] font-mono text-xs"
                          />
                          {idx > 0 && (
                            <button
                              onClick={() => {
                                updateDraft(prev => ({
                                  ...prev,
                                  identity: {
                                    ...prev.identity,
                                    terminalLines: prev.identity.terminalLines.filter((_, i) => i !== idx)
                                  }
                                }));
                              }}
                              className="p-1.5 text-[#A0A4AC] hover:text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* About Heading & Text */}
                  <div>
                    <label className="block font-mono text-xs text-[#A0A4AC] mb-1">About Section Heading</label>
                    <input
                      type="text"
                      value={data.identity.aboutHeading}
                      onChange={(e) => updateDraft(prev => ({
                        ...prev,
                        identity: { ...prev.identity, aboutHeading: e.target.value }
                      }))}
                      className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] focus:border-[#FCEE0A] text-[#F5F5F5] text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-[#A0A4AC] mb-1">About Extended Narrative</label>
                    <textarea
                      rows={4}
                      value={data.identity.aboutText}
                      onChange={(e) => updateDraft(prev => ({
                        ...prev,
                        identity: { ...prev.identity, aboutText: e.target.value }
                      }))}
                      className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] focus:border-[#FCEE0A] text-[#F5F5F5] text-xs font-sans resize-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: TECH STACK */}
              {activeTab === 'tech' && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-[rgba(255,255,255,0.08)]">
                    <h3 className="text-lg font-bold text-[#F5F5F5] uppercase">
                      Technology Matrix
                    </h3>
                    <p className="text-xs font-mono text-[#A0A4AC]">
                      Manage tools, languages, and frameworks. Strictly transparent proficiency levels.
                    </p>
                  </div>

                  {/* Add New Tech Form */}
                  <div className="p-4 rounded-xl bg-[#08090A] border border-[rgba(252,238,10,0.3)] flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      placeholder="Technology Name (e.g. C, Three.js, Docker)"
                      value={newTechName}
                      onChange={(e) => setNewTechName(e.target.value)}
                      className="flex-1 min-w-[180px] px-3 py-2 rounded-lg bg-[#111318] border border-[rgba(255,255,255,0.1)] text-[#F5F5F5] font-mono text-xs focus:outline-none focus:border-[#FCEE0A]"
                    />

                    <select
                      value={newTechCategory}
                      onChange={(e) => setNewTechCategory(e.target.value as TechCategory)}
                      className="px-3 py-2 rounded-lg bg-[#111318] border border-[rgba(255,255,255,0.1)] text-[#F5F5F5] font-mono text-xs"
                    >
                      <option value="Languages">Languages</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="AI & ML">AI & ML</option>
                      <option value="Visualization & Graphics">Visualization & Graphics</option>
                      <option value="Developer Tools">Developer Tools</option>
                      <option value="Currently Learning">Currently Learning</option>
                    </select>

                    <select
                      value={newTechLevel}
                      onChange={(e) => setNewTechLevel(e.target.value as TechProficiency)}
                      className="px-3 py-2 rounded-lg bg-[#111318] border border-[rgba(255,255,255,0.1)] text-[#F5F5F5] font-mono text-xs"
                    >
                      <option value="Building with">Building with</option>
                      <option value="Learning">Learning</option>
                      <option value="Exploring">Exploring</option>
                    </select>

                    <button
                      onClick={handleAddTech}
                      className="px-4 py-2 rounded-lg bg-[#FCEE0A] hover:bg-[#DFFF00] text-[#08090A] font-bold font-mono text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Tool</span>
                    </button>
                  </div>

                  {/* Existing Tech Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {data.techStack.map((tech) => (
                      <div
                        key={tech.id}
                        className="p-3 rounded-xl bg-[#08090A] border border-[rgba(255,255,255,0.06)] flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-xs text-[#F5F5F5]">
                            {tech.name}
                          </div>
                          <div className="font-mono text-[10px] text-[#A0A4AC]">
                            {tech.category} · <span className="text-[#FCEE0A]">{tech.level}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteTech(tech.id)}
                          className="p-1 text-[#A0A4AC] hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: LEARNING TRACKS */}
              {activeTab === 'tracks' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.08)]">
                    <div>
                      <h3 className="text-lg font-bold text-[#F5F5F5] uppercase">
                        Current Learning Tracks
                      </h3>
                      <p className="text-xs font-mono text-[#A0A4AC]">
                        Define active technical focus areas and roadmap sprints.
                      </p>
                    </div>

                    <button
                      onClick={handleAddLearningTrack}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold bg-[#FCEE0A] text-[#08090A] rounded-lg cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Focus Area</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {data.learningTracks.map((track, trackIdx) => (
                      <div
                        key={track.id}
                        className="p-4 rounded-xl bg-[#08090A] border border-[rgba(255,255,255,0.08)] space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={track.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDraft(prev => {
                                const tracks = [...prev.learningTracks];
                                tracks[trackIdx].title = val;
                                return { ...prev, learningTracks: tracks };
                              });
                            }}
                            className="text-sm font-bold text-[#F5F5F5] bg-transparent border-b border-transparent focus:border-[#FCEE0A] focus:outline-none w-2/3"
                          />

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={track.status}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDraft(prev => {
                                  const tracks = [...prev.learningTracks];
                                  tracks[trackIdx].status = val;
                                  return { ...prev, learningTracks: tracks };
                                });
                              }}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#161922] border border-[rgba(255,255,255,0.1)] text-[#FCEE0A]"
                            />

                            <button
                              onClick={() => handleDeleteTrack(track.id)}
                              className="p-1.5 text-[#A0A4AC] hover:text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Focus Areas Bullets */}
                        <div className="space-y-1.5">
                          <div className="font-mono text-[10px] text-[#A0A4AC] uppercase">Focus Points:</div>
                          {track.focusAreas.map((area, areaIdx) => (
                            <div key={areaIdx} className="flex items-center gap-2">
                              <span className="text-[#FCEE0A] text-xs">•</span>
                              <input
                                type="text"
                                value={area}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateDraft(prev => {
                                    const tracks = [...prev.learningTracks];
                                    tracks[trackIdx].focusAreas[areaIdx] = val;
                                    return { ...prev, learningTracks: tracks };
                                  });
                                }}
                                className="flex-1 px-2 py-1 rounded bg-[#111318] border border-[rgba(255,255,255,0.06)] text-xs text-[#A0A4AC] focus:text-[#F5F5F5]"
                              />
                              <button
                                onClick={() => {
                                  updateDraft(prev => {
                                    const tracks = [...prev.learningTracks];
                                    tracks[trackIdx].focusAreas = tracks[trackIdx].focusAreas.filter((_, i) => i !== areaIdx);
                                    return { ...prev, learningTracks: tracks };
                                  });
                                }}
                                className="text-zinc-500 hover:text-red-400"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              updateDraft(prev => {
                                const tracks = [...prev.learningTracks];
                                tracks[trackIdx].focusAreas.push('New focus topic');
                                return { ...prev, learningTracks: tracks };
                              });
                            }}
                            className="text-[11px] font-mono text-[#FCEE0A] hover:underline pt-1 inline-block"
                          >
                            + Add focus point
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: PRINCIPLES */}
              {activeTab === 'principles' && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-[rgba(255,255,255,0.08)]">
                    <h3 className="text-lg font-bold text-[#F5F5F5] uppercase">
                      Engineering Principles
                    </h3>
                    <p className="text-xs font-mono text-[#A0A4AC]">
                      Core engineering heuristics displayed on the public site.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {data.principles.map((principle, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[#08090A] border border-[rgba(255,255,255,0.06)] space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-[#FCEE0A]">RULE 0{idx + 1}</span>
                          <input
                            type="text"
                            value={principle.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDraft(prev => {
                                const list = [...prev.principles];
                                list[idx].title = val;
                                return { ...prev, principles: list };
                              });
                            }}
                            className="flex-1 px-3 py-1.5 rounded bg-[#111318] border border-[rgba(255,255,255,0.1)] text-[#F5F5F5] font-bold text-sm"
                          />
                        </div>

                        <div>
                          <textarea
                            rows={2}
                            value={principle.description}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDraft(prev => {
                                const list = [...prev.principles];
                                list[idx].description = val;
                                return { ...prev, principles: list };
                              });
                            }}
                            className="w-full px-3 py-1.5 rounded bg-[#111318] border border-[rgba(255,255,255,0.1)] text-[#A0A4AC] text-xs resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: CONTACT & LINKS */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-[rgba(255,255,255,0.08)]">
                    <h3 className="text-lg font-bold text-[#F5F5F5] uppercase">
                      Contact Coordinates & Socials
                    </h3>
                    <p className="text-xs font-mono text-[#A0A4AC]">
                      Update email, GitHub profile, LinkedIn, and custom domain.
                    </p>
                  </div>

                  <div className="space-y-4 max-w-xl">
                    <div>
                      <label className="block font-mono text-xs text-[#A0A4AC] mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={data.contact.email}
                        onChange={(e) => updateDraft(prev => ({
                          ...prev,
                          contact: { ...prev.contact, email: e.target.value }
                        }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] text-[#F5F5F5] font-mono text-xs focus:border-[#FCEE0A]"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-[#A0A4AC] mb-1">
                        GitHub Profile URL
                      </label>
                      <input
                        type="url"
                        value={data.contact.github}
                        onChange={(e) => updateDraft(prev => ({
                          ...prev,
                          contact: { ...prev.contact, github: e.target.value }
                        }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] text-[#F5F5F5] font-mono text-xs focus:border-[#FCEE0A]"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-[#A0A4AC] mb-1">
                        LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        value={data.contact.linkedin}
                        onChange={(e) => updateDraft(prev => ({
                          ...prev,
                          contact: { ...prev.contact, linkedin: e.target.value }
                        }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] text-[#F5F5F5] font-mono text-xs focus:border-[#FCEE0A]"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-[#A0A4AC] mb-1">
                        Custom Domain / Host URL (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. vibinapapchi.dev"
                        value={data.contact.portfolioDomain || ''}
                        onChange={(e) => updateDraft(prev => ({
                          ...prev,
                          contact: { ...prev.contact, portfolioDomain: e.target.value }
                        }))}
                        className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] text-[#F5F5F5] font-mono text-xs focus:border-[#FCEE0A]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: SECTION VISIBILITY */}
              {activeTab === 'visibility' && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-[rgba(255,255,255,0.08)]">
                    <h3 className="text-lg font-bold text-[#F5F5F5] uppercase">
                      Section Display Toggles
                    </h3>
                    <p className="text-xs font-mono text-[#A0A4AC]">
                      Turn sections on or off without altering underlying data.
                    </p>
                  </div>

                  <div className="space-y-3 max-w-md">
                    {Object.entries(data.visibility).map(([key, val]) => (
                      <label
                        key={key}
                        className="flex items-center justify-between p-3 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.06)] cursor-pointer"
                      >
                        <span className="font-mono text-xs text-[#F5F5F5] uppercase">
                          {key.replace(/([A-Z])/g, ' $1')} Section
                        </span>
                        <input
                          type="checkbox"
                          checked={val}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            updateDraft(prev => ({
                              ...prev,
                              visibility: { ...prev.visibility, [key]: checked }
                            }));
                          }}
                          className="w-4 h-4 accent-[#FCEE0A]"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 8: INQUIRIES */}
              {activeTab === 'inquiries' && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-[rgba(255,255,255,0.08)]">
                    <h3 className="text-lg font-bold text-[#F5F5F5] uppercase">
                      Received Transmissions & Inquiries
                    </h3>
                    <p className="text-xs font-mono text-[#A0A4AC]">
                      Messages dispatched via the portfolio contact form.
                    </p>
                  </div>

                  {inquiries.length === 0 ? (
                    <div className="text-center py-12 text-[#A0A4AC] font-mono text-xs">
                      NO TRANSMISSIONS LOGGED YET.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {inquiries.map((inq) => (
                        <div
                          key={inq.id}
                          className={`p-4 rounded-xl border transition-all ${
                            inq.read
                              ? 'bg-[#08090A]/60 border-[rgba(255,255,255,0.06)]'
                              : 'bg-[#111318] border-[rgba(252,238,10,0.35)] shadow-[0_0_12px_rgba(252,238,10,0.05)]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {!inq.read && (
                                <span className="w-2 h-2 rounded-full bg-[#FCEE0A]" />
                              )}
                              <span className="font-bold text-sm text-[#F5F5F5]">{inq.name}</span>
                              <span className="font-mono text-xs text-[#A0A4AC]">&lt;{inq.email}&gt;</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-[#A0A4AC]">
                                {new Date(inq.createdAt).toLocaleString()}
                              </span>
                              <button
                                onClick={() => toggleInquiryRead(inq.id)}
                                className="text-xs font-mono text-[#FCEE0A] hover:underline"
                              >
                                {inq.read ? 'Mark Unread' : 'Mark Read'}
                              </button>
                              <button
                                onClick={() => deleteInquiry(inq.id)}
                                className="p-1 text-[#A0A4AC] hover:text-red-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="font-mono text-xs text-[#FCEE0A] mb-1">
                            Subject: {inq.subject}
                          </div>

                          <p className="text-xs text-[#A0A4AC] whitespace-pre-wrap leading-relaxed mt-2 bg-[#08090A] p-3 rounded-lg border border-[rgba(255,255,255,0.04)]">
                            {inq.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 9: SECURITY */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-[rgba(255,255,255,0.08)]">
                    <h3 className="text-lg font-bold text-[#F5F5F5] uppercase">
                      Admin Credentials & Access
                    </h3>
                    <p className="text-xs font-mono text-[#A0A4AC]">
                      Update authorized administrator email and master access password.
                    </p>
                  </div>

                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (newPassword.length < 6) {
                        showNotification('error', 'Password must be at least 6 characters.');
                        return;
                      }
                      const res = await setupAdminAccount(newPassword, newEmail);
                      if (res.success) {
                        showNotification('success', 'Admin credentials updated successfully!');
                        setNewPassword('');
                      } else {
                        showNotification('error', res.error || 'Failed to update credentials.');
                      }
                    }} 
                    className="max-w-md space-y-4"
                  >
                    <div>
                      <label className="block font-mono text-xs text-[#A0A4AC] mb-1">Admin Email</label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] text-[#F5F5F5] font-mono text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs text-[#A0A4AC] mb-1">New Master Password</label>
                      <input
                        type="password"
                        placeholder="Enter new strong password (min 6 chars)..."
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] text-[#F5F5F5] font-mono text-xs"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-[#FCEE0A] hover:bg-[#DFFF00] text-[#08090A] font-bold font-mono text-xs uppercase"
                    >
                      Update Admin Password
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* PROJECT EDITOR MODAL */}
      {editingProject && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-[#08090A]/95 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#111318] border border-[#FCEE0A] rounded-2xl shadow-2xl p-6 my-auto max-h-[92vh] overflow-y-auto space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.08)]">
              <h3 className="text-lg font-bold text-[#F5F5F5] uppercase">
                {isNewProject ? 'Create New Project' : 'Edit Project Specifications'}
              </h3>
              <button
                onClick={() => setEditingProject(null)}
                className="p-1 text-[#A0A4AC] hover:text-[#FCEE0A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-[#A0A4AC] mb-1">Project Title *</label>
                <input
                  type="text"
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] text-[#F5F5F5] text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-[#A0A4AC] mb-1">Category *</label>
                <input
                  type="text"
                  value={editingProject.category}
                  onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                  placeholder="e.g. Engineering Tools, AI, Systems"
                  className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] text-[#F5F5F5] text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-[#A0A4AC] mb-1">Lifecycle Status</label>
                <select
                  value={editingProject.status}
                  onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as ProjectStatus })}
                  className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] text-[#F5F5F5] text-xs font-mono"
                >
                  <option value="Concept">Concept</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Prototype">Prototype</option>
                  <option value="Deployed">Deployed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs text-[#A0A4AC] mb-1">Featured on Home</label>
                <select
                  value={editingProject.featured ? 'true' : 'false'}
                  onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.value === 'true' })}
                  className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] text-[#F5F5F5] text-xs font-mono"
                >
                  <option value="true">Yes (Featured)</option>
                  <option value="false">No (Standard Gallery)</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs text-[#A0A4AC] mb-1">GitHub Repo URL</label>
                <input
                  type="url"
                  value={editingProject.githubUrl || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] text-[#F5F5F5] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-[#A0A4AC] mb-1">Live Demo URL</label>
                <input
                  type="url"
                  value={editingProject.demoUrl || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, demoUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] text-[#F5F5F5] text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-[#A0A4AC] mb-1">Short Description *</label>
              <textarea
                rows={2}
                value={editingProject.shortDescription}
                onChange={(e) => setEditingProject({ ...editingProject, shortDescription: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] text-[#F5F5F5] text-xs resize-none"
                required
              />
            </div>

            {/* Image upload / URL */}
            <div>
              <label className="block font-mono text-xs text-[#A0A4AC] mb-1">Cover Image (URL or Upload)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Image URL (e.g. /src/assets/images/...)"
                  value={editingProject.coverImage}
                  onChange={(e) => setEditingProject({ ...editingProject, coverImage: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] text-[#F5F5F5] text-xs font-mono"
                />

                <label className="px-3 py-2 rounded-lg bg-[#161922] hover:bg-[#22262E] text-[#F5F5F5] text-xs font-mono flex items-center gap-1.5 cursor-pointer border border-[rgba(255,255,255,0.08)]">
                  <Upload className="w-3.5 h-3.5 text-[#FCEE0A]" />
                  <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Tech Stack Tags */}
            <div>
              <label className="block font-mono text-xs text-[#A0A4AC] mb-1">Tech Stack Tags (Comma separated)</label>
              <input
                type="text"
                value={editingProject.techStack.join(', ')}
                onChange={(e) => setEditingProject({
                  ...editingProject,
                  techStack: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                placeholder="e.g. Three.js, WebGL, TypeScript, Python"
                className="w-full px-3 py-2 rounded-lg bg-[#08090A] border border-[rgba(255,255,255,0.1)] text-[#F5F5F5] text-xs font-mono"
              />
            </div>

            {/* 10-Section Case Study Fields */}
            <div className="pt-4 border-t border-[rgba(255,255,255,0.08)] space-y-4">
              <h4 className="font-mono text-xs text-[#FCEE0A] uppercase tracking-wider">
                10-Section Technical Case Study Details
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block font-mono text-[11px] text-[#A0A4AC] mb-0.5">01. Problem Statement</label>
                  <textarea
                    rows={2}
                    value={editingProject.caseStudy?.problemStatement || ''}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      caseStudy: { ...editingProject.caseStudy, problemStatement: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 rounded bg-[#08090A] border border-[rgba(255,255,255,0.08)] text-xs text-[#F5F5F5] resize-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#A0A4AC] mb-0.5">02. Intended Users</label>
                  <textarea
                    rows={1}
                    value={editingProject.caseStudy?.intendedUsers || ''}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      caseStudy: { ...editingProject.caseStudy, intendedUsers: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 rounded bg-[#08090A] border border-[rgba(255,255,255,0.08)] text-xs text-[#F5F5F5] resize-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#A0A4AC] mb-0.5">03. Why The Problem Matters</label>
                  <textarea
                    rows={2}
                    value={editingProject.caseStudy?.whyItMatters || ''}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      caseStudy: { ...editingProject.caseStudy, whyItMatters: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 rounded bg-[#08090A] border border-[rgba(255,255,255,0.08)] text-xs text-[#F5F5F5] resize-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#A0A4AC] mb-0.5">04. System Architecture</label>
                  <textarea
                    rows={2}
                    value={editingProject.caseStudy?.systemArchitecture || ''}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      caseStudy: { ...editingProject.caseStudy, systemArchitecture: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 rounded bg-[#08090A] border border-[rgba(255,255,255,0.08)] text-xs text-[#F5F5F5] resize-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#A0A4AC] mb-0.5">05. Technical Decisions & Trade-Offs</label>
                  <textarea
                    rows={2}
                    value={editingProject.caseStudy?.decisionsAndTradeoffs || ''}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      caseStudy: { ...editingProject.caseStudy, decisionsAndTradeoffs: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 rounded bg-[#08090A] border border-[rgba(255,255,255,0.08)] text-xs text-[#F5F5F5] resize-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#A0A4AC] mb-0.5">06. Implementation Details</label>
                  <textarea
                    rows={2}
                    value={editingProject.caseStudy?.implementationDetails || ''}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      caseStudy: { ...editingProject.caseStudy, implementationDetails: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 rounded bg-[#08090A] border border-[rgba(255,255,255,0.08)] text-xs text-[#F5F5F5] resize-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#A0A4AC] mb-0.5">07. Challenges & Debugging</label>
                  <textarea
                    rows={2}
                    value={editingProject.caseStudy?.challengesAndDebugging || ''}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      caseStudy: { ...editingProject.caseStudy, challengesAndDebugging: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 rounded bg-[#08090A] border border-[rgba(255,255,255,0.08)] text-xs text-[#F5F5F5] resize-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#A0A4AC] mb-0.5">08. Current Limitations</label>
                  <textarea
                    rows={2}
                    value={editingProject.caseStudy?.currentLimitations || ''}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      caseStudy: { ...editingProject.caseStudy, currentLimitations: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 rounded bg-[#08090A] border border-[rgba(255,255,255,0.08)] text-xs text-[#F5F5F5] resize-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#A0A4AC] mb-0.5">09. Validation & Results</label>
                  <textarea
                    rows={2}
                    value={editingProject.caseStudy?.validationAndResults || ''}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      caseStudy: { ...editingProject.caseStudy, validationAndResults: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 rounded bg-[#08090A] border border-[rgba(255,255,255,0.08)] text-xs text-[#F5F5F5] resize-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#A0A4AC] mb-0.5">10. Future Improvements</label>
                  <textarea
                    rows={2}
                    value={editingProject.caseStudy?.futureImprovements || ''}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      caseStudy: { ...editingProject.caseStudy, futureImprovements: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 rounded bg-[#08090A] border border-[rgba(255,255,255,0.08)] text-xs text-[#F5F5F5] resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 rounded-lg bg-[#161922] text-[#A0A4AC] hover:text-[#F5F5F5] text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProjectModal}
                className="px-5 py-2 rounded-lg bg-[#FCEE0A] hover:bg-[#DFFF00] text-[#08090A] font-bold text-xs font-mono uppercase"
              >
                Apply to Draft
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
