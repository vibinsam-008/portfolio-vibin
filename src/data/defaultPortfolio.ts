import { PortfolioData } from '../types/portfolio.ts';

export const initialPortfolioData: PortfolioData = {
  identity: {
    name: 'Vibin Apapchi A',
    role: 'CSE Undergraduate at Madras Institute of Technology, Chennai',
    graduationYear: '2030',
    identityTagline: 'Student engineer, software builder, and aspiring systems-oriented problem solver.',
    availabilityStatus: 'AVAILABLE FOR MEANINGFUL TECHNICAL COLLABORATION',
    heroHeadlinePrimary: 'BUILDING SYSTEMS.',
    heroHeadlineSecondary: 'SOLVING REAL PROBLEMS.',
    heroBio: "I'm a CSE undergraduate exploring the intersection of software engineering, AI applications, and systems-oriented problem solving. I learn by building, testing, and improving real products.",
    terminalLines: [
      'CURRENT_FOCUS',
      'AI APPLICATION ENGINEERING',
      'ENGINEERING VISUALIZATION',
      'C PROGRAMMING & ALGORITHMIC THINKING'
    ],
    aboutHeading: 'Engineer in Progress. Builder by Practice.',
    aboutText: 'Studying Computer Science and Engineering at Madras Institute of Technology (MIT Chennai). I focus on building software that addresses practical problems, exploring AI-assisted workflows and interactive engineering tools, and developing rigorous foundations in programming, algorithms, and systems. Actively seeking meaningful technical collaboration and opportunities to learn with fellow builders.',
    philosophies: [
      {
        title: 'BUILD',
        subtitle: 'Practical Systems',
        description: 'Develop practical applications and prototypes that solve tangible operational bottlenecks.'
      },
      {
        title: 'UNDERSTAND',
        subtitle: 'Foundational Depth',
        description: 'Investigate how systems work under the hood, how protocols communicate, and why failures occur.'
      },
      {
        title: 'IMPROVE',
        subtitle: 'Empirical Iteration',
        description: 'Test assumptions, measure outcomes against concrete metrics, and systematically refine implementations.'
      }
    ]
  },
  projects: [
    {
      id: 'proj-01-engineering-drawing-ai',
      title: 'Engineering Drawing AI Agent',
      shortDescription: 'An AI-assisted engineering graphics tool exploring the conversion of textual and visual problem inputs into graphical projections.',
      category: 'Engineering Tools',
      status: 'Prototype',
      techStack: ['Vision LLM', 'OCR', 'Three.js', 'WebGL', 'TypeScript', 'Computational Geometry'],
      coverImage: '/src/assets/images/project_engineering_drawing_ai_1793887067739.jpg',
      githubUrl: 'https://github.com/vibinapapchi',
      demoUrl: '',
      startDate: '2025-01',
      lastUpdated: '2025-10',
      featured: true,
      order: 1,
      caseStudy: {
        problemStatement: 'In engineering graphics education and industrial drafting, interpreting ambiguous verbal problem descriptions or rough hand sketches into standardized isometric and orthographic projections is time-consuming and error-prone.',
        intendedUsers: 'Engineering students, drafters, and educators working with descriptive geometry, isometric views, and machine drawing standards.',
        whyItMatters: 'Manual 2D-to-3D projection requires high spatial visualization skills. Automating the baseline projection reduces instructional barriers and provides immediate visual verification of geometric reasoning.',
        systemArchitecture: 'A dual-stage pipeline: Stage 1 parses natural language specifications and annotated raster diagrams via multimodal vision pipelines to identify projection planes, datum lines, and dimensions. Stage 2 executes a geometric constraint engine in WebGL/Three.js to synthesize interactive 3D geometry and export orthographic projections.',
        decisionsAndTradeoffs: 'Prioritized WebGL browser-based rendering over heavy native desktop CAD engines to ensure instant accessibility for students on lightweight laptops without software installations.',
        implementationDetails: 'Custom coordinate transformation matrices translate extracted datum lines and projection vectors into normalized 3D vertex buffers rendered in real-time with Three.js line segments and dimension callouts.',
        challengesAndDebugging: 'Resolving OCR hallucination and perspective distortion on skewed photos of physical drafting paper. Implemented homography correction and dimension sanity bounds.',
        currentLimitations: 'Currently optimizing the precision and reliability of interpreted dimensions from low-contrast pencil sketches and complex compound fillets.',
        validationAndResults: 'Validated on standard MIT Chennai engineering graphics textbook problems with canonical prisms, cylinders, and stepped blocks with high visual alignment.',
        futureImprovements: 'Integrate parametric STEP/DXF export, automated section-view hatching, and real-time dimension conflict resolution.'
      }
    },
    {
      id: 'proj-02-doms-mit',
      title: 'DOMS-MIT',
      shortDescription: 'A digital outpass workflow designed to streamline requests and approval processes in a college hostel environment.',
      category: 'Systems',
      status: 'In Progress',
      techStack: ['TypeScript', 'React', 'Node.js', 'Express', 'Role-Based Access', 'Workflow Automation'],
      coverImage: '/src/assets/images/project_doms_mit_1793887067657.jpg',
      githubUrl: 'https://github.com/vibinapapchi',
      demoUrl: '',
      startDate: '2024-11',
      lastUpdated: '2025-09',
      featured: true,
      order: 2,
      caseStudy: {
        problemStatement: 'Hostel outpass management often relies on manual paper ledgers, fragmented WhatsApp messages, and delayed physical signatures, leading to administrative bottlenecks and student frustration.',
        intendedUsers: 'Hostel residents, wardens, residential advisors, and campus security personnel at MIT Chennai.',
        whyItMatters: 'Safety and accountability require verifiable timestamps, rapid guardian consent verification, and instant gate verification without queueing at security checkpoints.',
        systemArchitecture: 'Client-server architecture featuring state-machine based request lifecycle management (Draft -> Submitted -> Warden Verified -> Gate Clearance -> Checked Out -> Returned).',
        decisionsAndTradeoffs: 'Chose a mobile-first responsive web client with QR-based clearance tokens over a native app to allow friction-free access on any mobile browser.',
        implementationDetails: 'Implemented role-based authorization tokens, auditable request state transitions, and responsive student/warden portal views.',
        challengesAndDebugging: 'Handling network latency during peak curfew hours at physical campus gates. Designed cached offline-verifiable cryptographic outpass tokens.',
        currentLimitations: 'In active internal testing; SMS gateway integration and biometric terminal syncing are currently in development.',
        validationAndResults: 'Simulated multi-role approval flows cut request turnaround from hours to minutes in pilot staging tests.',
        futureImprovements: 'Hostel capacity analytics, automated parent notification webhooks, and emergency curfew broadcasts.'
      }
    },
    {
      id: 'proj-03-cognizota',
      title: 'Cognizota',
      shortDescription: 'An educational technology project exploring focused study sessions, attention tracking, and feedback-driven learning experiences.',
      category: 'Web Development',
      status: 'Concept',
      techStack: ['TypeScript', 'React', 'State Machine', 'Focus Telemetry', 'Web Audio API'],
      coverImage: '/src/assets/images/project_cognizota_1793887067703.jpg',
      githubUrl: 'https://github.com/vibinapapchi',
      demoUrl: '',
      startDate: '2025-03',
      lastUpdated: '2025-08',
      featured: true,
      order: 3,
      caseStudy: {
        problemStatement: 'Unstructured study blocks frequently suffer from digital distraction, cognitive fatigue, and lack of objective reflection on sustained attention spans.',
        intendedUsers: 'Students, self-directed learners, and researchers undertaking deep technical learning sprints.',
        whyItMatters: 'Sustained focus is the single highest leverage skill for mastering hard computer science and mathematics fundamentals.',
        systemArchitecture: 'A lightweight client-side focus state engine using the Pomodoro/Flow cycle paradigm combined with session event logging and reflection feedback prompts.',
        decisionsAndTradeoffs: 'Client-first local-storage focus mode to guarantee total user privacy and zero data harvesting of personal study habits.',
        implementationDetails: 'Non-intrusive sound cues via Web Audio API, dynamic ambient UI dimming, and task-switching penalty friction.',
        challengesAndDebugging: 'Designing non-punitive focus reminders that encourage resumption rather than triggering frustration.',
        currentLimitations: 'Concept stage; currently exploring attention heuristics and correlation with perceived task difficulty.',
        validationAndResults: 'Early personal dogfooding demonstrated marked reduction in context switching during 90-minute coding blocks.',
        futureImprovements: 'Spaced repetition flashcard integration, ambient binaural sound generation, and weekly cognitive stamina reports.'
      }
    }
  ],
  techStack: [
    { id: 'tech-1', name: 'C', category: 'Languages', level: 'Building with', order: 1 },
    { id: 'tech-2', name: 'TypeScript', category: 'Languages', level: 'Building with', order: 2 },
    { id: 'tech-3', name: 'JavaScript', category: 'Languages', level: 'Building with', order: 3 },
    { id: 'tech-4', name: 'React', category: 'Frontend', level: 'Building with', order: 4 },
    { id: 'tech-5', name: 'Tailwind CSS', category: 'Frontend', level: 'Building with', order: 5 },
    { id: 'tech-6', name: 'Node.js', category: 'Backend', level: 'Building with', order: 6 },
    { id: 'tech-7', name: 'Express', category: 'Backend', level: 'Building with', order: 7 },
    { id: 'tech-8', name: 'Three.js', category: 'Visualization & Graphics', level: 'Learning', order: 8 },
    { id: 'tech-9', name: 'WebGL', category: 'Visualization & Graphics', level: 'Exploring', order: 9 },
    { id: 'tech-10', name: 'AI Application Engineering', category: 'AI & ML', level: 'Learning', order: 10 },
    { id: 'tech-11', name: 'Vision LLM & OCR Pipelines', category: 'AI & ML', level: 'Exploring', order: 11 },
    { id: 'tech-12', name: 'Git & GitHub', category: 'Developer Tools', level: 'Building with', order: 12 },
    { id: 'tech-13', name: 'Linux & Shell', category: 'Developer Tools', level: 'Building with', order: 13 }
  ],
  learningTracks: [
    {
      id: 'track-1',
      title: 'Computer Science Fundamentals',
      focusAreas: [
        'C programming and low-level memory mental models',
        'Data structures, asymptotic analysis, and algorithmic thinking',
        'Independent engineering problem decomposition'
      ],
      priority: 'Active',
      status: 'Current Semester Core',
      order: 1
    },
    {
      id: 'track-2',
      title: 'AI Application Engineering',
      focusAreas: [
        'Reliable multimodal model integration and streaming',
        'Input schema validation, sanitization, and structured JSON outputs',
        'Systematic testing, error boundaries, and debugging in AI workflows'
      ],
      priority: 'Active',
      status: 'Active Experimentation',
      order: 2
    },
    {
      id: 'track-3',
      title: 'Engineering Visualization',
      focusAreas: [
        'Interactive 3D rendering with Three.js and WebGL shaders',
        'Descriptive geometry, camera matrices, and orthographic projections',
        'Bridging OCR coordinate extraction to precise vector geometry'
      ],
      priority: 'Active',
      status: 'Research & Prototyping',
      order: 3
    }
  ],
  principles: [
    {
      id: 'principle-1',
      title: 'Problem before technology.',
      description: 'Start with the concrete operational friction or user pain point. Never pick an architecture merely because it is fashionable.',
      iconName: 'Target'
    },
    {
      id: 'principle-2',
      title: 'Correctness before appearance.',
      description: 'A polished visual interface that silently miscalculates geometry or corrupts state is a failure of software engineering.',
      iconName: 'ShieldCheck'
    },
    {
      id: 'principle-3',
      title: 'Evidence before claims.',
      description: 'Measure runtime performance, benchmark latency, and cite reproducible test data instead of making unverified assertions.',
      iconName: 'FileText'
    },
    {
      id: 'principle-4',
      title: 'Iteration before perfection.',
      description: 'Ship working, verifiable prototypes quickly, measure real behavior under realistic constraints, and systematically refine.',
      iconName: 'Repeat'
    }
  ],
  contact: {
    email: 'vibinappachi@gmail.com',
    github: 'https://github.com/vibinapapchi',
    linkedin: 'https://linkedin.com/in/vibinapapchi',
    portfolioDomain: ''
  },
  visibility: {
    about: true,
    projects: true,
    techStack: true,
    learningTrack: true,
    principles: true,
    contact: true
  },
  updatedAt: new Date().toISOString()
};
