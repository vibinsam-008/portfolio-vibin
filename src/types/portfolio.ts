export type ProjectStatus = 'Concept' | 'In Progress' | 'Prototype' | 'Deployed' | 'Archived';
export type TechProficiency = 'Building with' | 'Learning' | 'Exploring';
export type TechCategory = 
  | 'Languages' 
  | 'Frontend' 
  | 'Backend' 
  | 'AI & ML' 
  | 'Visualization & Graphics' 
  | 'Developer Tools' 
  | 'Currently Learning';

export interface ProjectCaseStudy {
  problemStatement?: string;
  intendedUsers?: string;
  whyItMatters?: string;
  systemArchitecture?: string;
  decisionsAndTradeoffs?: string;
  implementationDetails?: string;
  challengesAndDebugging?: string;
  currentLimitations?: string;
  validationAndResults?: string;
  futureImprovements?: string;
}

export interface Project {
  id: string;
  title: string;
  shortDescription: string;
  category: string;
  status: ProjectStatus;
  techStack: string[];
  coverImage: string;
  githubUrl?: string;
  demoUrl?: string;
  startDate?: string;
  lastUpdated?: string;
  featured: boolean;
  order: number;
  caseStudy?: ProjectCaseStudy;
}

export interface CorePhilosophy {
  title: string;
  subtitle: string;
  description: string;
}

export interface PersonalIdentity {
  name: string;
  role: string;
  graduationYear: string;
  identityTagline: string;
  availabilityStatus: string;
  heroHeadlinePrimary: string;
  heroHeadlineSecondary: string;
  heroBio: string;
  terminalLines: string[];
  aboutHeading: string;
  aboutText: string;
  philosophies: CorePhilosophy[];
}

export interface TechStackItem {
  id: string;
  name: string;
  category: TechCategory;
  level: TechProficiency;
  order: number;
}

export interface LearningTrackItem {
  id: string;
  title: string;
  focusAreas: string[];
  priority: 'Active' | 'High' | 'Planned' | 'Archived';
  status: string;
  order: number;
}

export interface EngineeringPrinciple {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface ContactInfo {
  email: string;
  github: string;
  linkedin: string;
  portfolioDomain?: string;
}

export interface SectionVisibility {
  about: boolean;
  projects: boolean;
  techStack: boolean;
  learningTrack: boolean;
  principles: boolean;
  contact: boolean;
}

export interface PortfolioData {
  identity: PersonalIdentity;
  projects: Project[];
  techStack: TechStackItem[];
  learningTracks: LearningTrackItem[];
  principles: EngineeringPrinciple[];
  contact: ContactInfo;
  visibility: SectionVisibility;
  updatedAt: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}
