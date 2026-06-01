// ─── Categories ───
export const categories = [
  {
    id: 'web-development',
    name: 'Web Development',
    icon: '🌐',
    description: 'Master modern web technologies and build full-stack applications',
    courseCount: 12,
    color: '#6366f1',
  },
  {
    id: 'data-science',
    name: 'Data Science',
    icon: '📊',
    description: 'Analyze data, build models, and extract actionable insights',
    courseCount: 9,
    color: '#8b5cf6',
  },
  {
    id: 'mobile-development',
    name: 'Mobile Development',
    icon: '📱',
    description: 'Create beautiful native and cross-platform mobile apps',
    courseCount: 7,
    color: '#06b6d4',
  },
  {
    id: 'ui-ux-design',
    name: 'UI/UX Design',
    icon: '🎨',
    description: 'Design stunning user interfaces and seamless experiences',
    courseCount: 8,
    color: '#f43f5e',
  },
  {
    id: 'cloud-devops',
    name: 'Cloud & DevOps',
    icon: '☁️',
    description: 'Deploy, scale, and manage infrastructure in the cloud',
    courseCount: 6,
    color: '#10b981',
  },
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    icon: '🤖',
    description: 'Build intelligent systems with cutting-edge AI techniques',
    courseCount: 8,
    color: '#f59e0b',
  },
];

// ─── Courses ───
export const courses = [
  {
    id: 'course-1',
    slug: 'complete-react-nextjs-masterclass',
    title: 'Complete React & Next.js Masterclass',
    shortDescription:
      'Build production-ready web applications with React 18 and Next.js 14 from scratch.',
    description: `This comprehensive masterclass takes you from React fundamentals to building production-grade applications with Next.js 14. You'll learn hooks, context, server components, API routes, authentication, and deployment strategies used by top tech companies.

By the end of this course you will have built three complete projects — a portfolio site, an e-commerce store, and a real-time dashboard — giving you the confidence to tackle any web application.

Whether you are a beginner exploring frontend development or an experienced developer wanting to master the React ecosystem, this course provides a structured, hands-on path to expertise.`,
    price: 2999,
    discountPrice: 1499,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=340&fit=crop',
    instructor: {
      name: 'Aarav Sharma',
      bio: 'Senior Frontend Engineer at a Fortune-500 fintech company with 8+ years of React experience. Open-source contributor and conference speaker.',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    difficultyLevel: 'Intermediate',
    durationHours: 42,
    enrollmentCount: 3420,
    ratingAvg: 4.8,
    category: 'web-development',
    syllabus: [
      {
        title: 'React Fundamentals',
        lessons: [
          { title: 'Introduction to React', duration: '12:30' },
          { title: 'JSX & Components', duration: '18:45' },
          { title: 'Props & State', duration: '22:10' },
          { title: 'Event Handling', duration: '15:20' },
        ],
      },
      {
        title: 'Advanced React Patterns',
        lessons: [
          { title: 'Custom Hooks', duration: '25:00' },
          { title: 'Context API & useReducer', duration: '28:30' },
          { title: 'Performance Optimization', duration: '20:15' },
          { title: 'Error Boundaries', duration: '14:40' },
        ],
      },
      {
        title: 'Next.js 14 Deep Dive',
        lessons: [
          { title: 'App Router & Server Components', duration: '30:00' },
          { title: 'Data Fetching Strategies', duration: '26:15' },
          { title: 'API Routes & Middleware', duration: '22:50' },
          { title: 'Authentication with NextAuth', duration: '35:20' },
        ],
      },
      {
        title: 'Deployment & Beyond',
        lessons: [
          { title: 'Testing React Apps', duration: '24:00' },
          { title: 'CI/CD with Vercel', duration: '18:30' },
          { title: 'Performance Auditing', duration: '16:45' },
        ],
      },
    ],
    features: [
      'Build 3 real-world projects',
      'Server-side rendering & static generation',
      'Authentication & authorization',
      'REST & GraphQL integration',
      'Deployment on Vercel & AWS',
      'Lifetime access with updates',
    ],
    isPublished: true,
  },
  {
    id: 'course-2',
    slug: 'advanced-javascript-patterns',
    title: 'Advanced JavaScript Design Patterns',
    shortDescription:
      'Elevate your JS skills with battle-tested design patterns used in enterprise codebases.',
    description: `Go beyond the basics and explore the design patterns that power large-scale JavaScript applications. From creational and structural patterns to reactive and functional paradigms, this course covers everything you need to write clean, maintainable, and scalable code.

Each pattern is explained with real-world examples from popular open-source projects. You will also learn when NOT to use a pattern — an insight many courses overlook.

Perfect for mid-level developers preparing for senior roles or technical interviews at top companies.`,
    price: 1999,
    discountPrice: 999,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&h=340&fit=crop',
    instructor: {
      name: 'Priya Patel',
      bio: 'JavaScript architect and author of "Patterns in the Wild". 10 years building large-scale SPAs.',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    difficultyLevel: 'Advanced',
    durationHours: 28,
    enrollmentCount: 1870,
    ratingAvg: 4.9,
    category: 'web-development',
    syllabus: [
      {
        title: 'Creational Patterns',
        lessons: [
          { title: 'Singleton & Factory', duration: '20:00' },
          { title: 'Builder & Prototype', duration: '22:30' },
          { title: 'Abstract Factory', duration: '18:15' },
        ],
      },
      {
        title: 'Structural Patterns',
        lessons: [
          { title: 'Decorator & Proxy', duration: '24:00' },
          { title: 'Adapter & Facade', duration: '19:45' },
          { title: 'Composite Pattern', duration: '16:30' },
        ],
      },
      {
        title: 'Behavioral Patterns',
        lessons: [
          { title: 'Observer & Mediator', duration: '26:00' },
          { title: 'Strategy & Command', duration: '22:15' },
          { title: 'State Machines', duration: '28:40' },
        ],
      },
    ],
    features: [
      'Enterprise-grade patterns',
      'Real-world code examples',
      'Interview preparation',
      'Refactoring exercises',
      'Downloadable cheat sheets',
      'Certificate of completion',
    ],
    isPublished: true,
  },
  {
    id: 'course-3',
    slug: 'python-data-science-ml',
    title: 'Python for Data Science & Machine Learning',
    shortDescription:
      'From pandas to neural networks — your complete data science journey in Python.',
    description: `Start with Python fundamentals and progress through data manipulation with pandas, visualization with matplotlib and seaborn, statistical analysis, and machine learning with scikit-learn. The final module introduces deep learning with TensorFlow.

You'll work with real datasets from Kaggle competitions and build an end-to-end ML pipeline that you can showcase in your portfolio.

No prior data science experience needed — just basic programming knowledge.`,
    price: 2499,
    discountPrice: 1299,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop',
    instructor: {
      name: 'Dr. Rahul Verma',
      bio: 'Ph.D. in Computer Science, ex-Google ML researcher. Published 15+ papers in top-tier ML conferences.',
      avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
    },
    difficultyLevel: 'Beginner',
    durationHours: 56,
    enrollmentCount: 5210,
    ratingAvg: 4.7,
    category: 'data-science',
    syllabus: [
      {
        title: 'Python Essentials',
        lessons: [
          { title: 'Python Setup & Basics', duration: '15:00' },
          { title: 'Data Structures', duration: '22:30' },
          { title: 'Functions & OOP', duration: '25:00' },
        ],
      },
      {
        title: 'Data Analysis with Pandas',
        lessons: [
          { title: 'DataFrames & Series', duration: '28:00' },
          { title: 'Data Cleaning', duration: '32:15' },
          { title: 'GroupBy & Aggregations', duration: '24:30' },
        ],
      },
      {
        title: 'Machine Learning',
        lessons: [
          { title: 'Linear & Logistic Regression', duration: '35:00' },
          { title: 'Decision Trees & Random Forests', duration: '30:20' },
          { title: 'Model Evaluation & Tuning', duration: '28:45' },
          { title: 'Neural Networks Intro', duration: '40:00' },
        ],
      },
    ],
    features: [
      'Real Kaggle datasets',
      'End-to-end ML pipeline project',
      'Jupyter notebooks included',
      'Statistical analysis deep-dive',
      'TensorFlow introduction',
      'Career guidance for data roles',
    ],
    isPublished: true,
  },
  {
    id: 'course-4',
    slug: 'sql-analytics-bootcamp',
    title: 'SQL & Analytics Bootcamp',
    shortDescription:
      'Master SQL queries, window functions, and analytics dashboards for data-driven decisions.',
    description: `Become proficient in SQL with this intensive bootcamp. Starting from SELECT statements, you'll advance through joins, subqueries, window functions, CTEs, and query optimization.

The course includes hands-on projects analyzing real business data — sales analytics, customer segmentation, and funnel analysis — using PostgreSQL.

You'll also learn to build interactive dashboards and connect SQL to visualization tools.`,
    price: 1499,
    discountPrice: 799,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop',
    instructor: {
      name: 'Sneha Gupta',
      bio: 'Senior Data Analyst at a leading e-commerce company. SQL instructor with 4000+ students mentored.',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    },
    difficultyLevel: 'Beginner',
    durationHours: 32,
    enrollmentCount: 4100,
    ratingAvg: 4.6,
    category: 'data-science',
    syllabus: [
      {
        title: 'SQL Foundations',
        lessons: [
          { title: 'SELECT, WHERE, ORDER BY', duration: '18:00' },
          { title: 'JOINs Deep Dive', duration: '25:30' },
          { title: 'Subqueries & CTEs', duration: '22:00' },
        ],
      },
      {
        title: 'Advanced SQL',
        lessons: [
          { title: 'Window Functions', duration: '30:00' },
          { title: 'Query Optimization', duration: '26:15' },
          { title: 'Stored Procedures', duration: '20:45' },
        ],
      },
      {
        title: 'Analytics Projects',
        lessons: [
          { title: 'Sales Funnel Analysis', duration: '35:00' },
          { title: 'Customer Segmentation', duration: '28:30' },
          { title: 'Dashboard Building', duration: '32:00' },
        ],
      },
    ],
    features: [
      'PostgreSQL hands-on labs',
      'Real business datasets',
      'Dashboard projects',
      'Interview SQL challenges',
      'Performance tuning tips',
      'Certificate of completion',
    ],
    isPublished: true,
  },
  {
    id: 'course-5',
    slug: 'react-native-mobile-apps',
    title: 'React Native — Build Mobile Apps',
    shortDescription:
      'Create beautiful, cross-platform iOS and Android apps with React Native and Expo.',
    description: `Learn to build cross-platform mobile applications using React Native and Expo. This course covers navigation, state management, native device features (camera, GPS, notifications), and publishing to the App Store and Google Play.

You will build three complete apps — a social feed, a fitness tracker, and a food delivery UI — that demonstrate best practices in mobile development.

Ideal for React developers wanting to expand into mobile.`,
    price: 2499,
    discountPrice: 1399,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=340&fit=crop',
    instructor: {
      name: 'Karan Mehta',
      bio: 'Mobile lead at a health-tech startup. Built apps with 1M+ downloads on both stores.',
      avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    },
    difficultyLevel: 'Intermediate',
    durationHours: 38,
    enrollmentCount: 2340,
    ratingAvg: 4.7,
    category: 'mobile-development',
    syllabus: [
      {
        title: 'Getting Started',
        lessons: [
          { title: 'Expo Setup & Navigation', duration: '20:00' },
          { title: 'Core Components', duration: '24:30' },
          { title: 'Styling & Layouts', duration: '18:00' },
        ],
      },
      {
        title: 'State & Data',
        lessons: [
          { title: 'Redux Toolkit', duration: '28:00' },
          { title: 'API Integration', duration: '22:15' },
          { title: 'Offline Storage', duration: '19:45' },
        ],
      },
      {
        title: 'Native Features',
        lessons: [
          { title: 'Camera & Media', duration: '26:00' },
          { title: 'Push Notifications', duration: '22:30' },
          { title: 'Maps & Geolocation', duration: '24:00' },
        ],
      },
      {
        title: 'Publishing',
        lessons: [
          { title: 'App Store Submission', duration: '18:00' },
          { title: 'Google Play Submission', duration: '16:30' },
        ],
      },
    ],
    features: [
      '3 complete app projects',
      'Expo & bare workflow',
      'Push notifications',
      'Maps & geolocation',
      'App store publishing guide',
      'Lifetime access',
    ],
    isPublished: true,
  },
  {
    id: 'course-6',
    slug: 'flutter-dart-complete-guide',
    title: 'Flutter & Dart — The Complete Guide',
    shortDescription:
      'Build stunning native apps for iOS, Android, and web using Flutter 3 and Dart.',
    description: `Dive deep into Flutter and Dart to create beautiful, natively compiled applications. From widgets and state management with Riverpod to Firebase integration and platform-specific code, this course covers the full spectrum.

You will build a chat app, a shopping app, and a news reader — each progressively more complex.

Flutter is one of the fastest-growing mobile frameworks, and this course prepares you for real-world projects.`,
    price: 2299,
    discountPrice: 1199,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=340&fit=crop',
    instructor: {
      name: 'Ananya Reddy',
      bio: 'Google Developer Expert for Flutter. Speaker at FlutterConf and DartUp.',
      avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    },
    difficultyLevel: 'Beginner',
    durationHours: 44,
    enrollmentCount: 3180,
    ratingAvg: 4.8,
    category: 'mobile-development',
    syllabus: [
      {
        title: 'Dart Fundamentals',
        lessons: [
          { title: 'Dart Syntax & Types', duration: '16:00' },
          { title: 'OOP in Dart', duration: '22:30' },
          { title: 'Async & Futures', duration: '20:00' },
        ],
      },
      {
        title: 'Flutter Core',
        lessons: [
          { title: 'Widgets & Layouts', duration: '28:00' },
          { title: 'Navigation & Routing', duration: '24:15' },
          { title: 'State Management (Riverpod)', duration: '32:30' },
        ],
      },
      {
        title: 'Backend & Deployment',
        lessons: [
          { title: 'Firebase Integration', duration: '30:00' },
          { title: 'REST API Consumption', duration: '22:45' },
          { title: 'Building & Publishing', duration: '18:00' },
        ],
      },
    ],
    features: [
      '3 real-world projects',
      'Dart language deep-dive',
      'Riverpod state management',
      'Firebase auth & Firestore',
      'Platform channels',
      'Responsive UI techniques',
    ],
    isPublished: true,
  },
  {
    id: 'course-7',
    slug: 'figma-ui-design-masterclass',
    title: 'Figma UI Design Masterclass',
    shortDescription:
      'Design pixel-perfect interfaces in Figma — from wireframes to high-fidelity prototypes.',
    description: `Master Figma from scratch and learn to design beautiful, functional user interfaces. This course covers design principles, typography, color theory, component libraries, auto-layout, prototyping, and handoff to developers.

You will design a complete SaaS dashboard, a mobile banking app, and a marketing landing page in guided projects.

No prior design experience required — just creativity and enthusiasm.`,
    price: 1999,
    discountPrice: 999,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=340&fit=crop',
    instructor: {
      name: 'Meera Joshi',
      bio: 'Lead Product Designer with 7 years at design agencies. Figma Community advocate.',
      avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    },
    difficultyLevel: 'Beginner',
    durationHours: 30,
    enrollmentCount: 2890,
    ratingAvg: 4.9,
    category: 'ui-ux-design',
    syllabus: [
      {
        title: 'Design Foundations',
        lessons: [
          { title: 'Design Principles & Theory', duration: '20:00' },
          { title: 'Typography & Color', duration: '24:30' },
          { title: 'Layout & Grid Systems', duration: '18:00' },
        ],
      },
      {
        title: 'Figma Mastery',
        lessons: [
          { title: 'Figma Interface & Tools', duration: '22:00' },
          { title: 'Components & Variants', duration: '28:15' },
          { title: 'Auto Layout Deep Dive', duration: '26:30' },
        ],
      },
      {
        title: 'Projects',
        lessons: [
          { title: 'SaaS Dashboard Design', duration: '45:00' },
          { title: 'Mobile App Design', duration: '40:00' },
          { title: 'Developer Handoff', duration: '18:00' },
        ],
      },
    ],
    features: [
      'Figma fundamentals to advanced',
      'Design system creation',
      'Interactive prototyping',
      'Developer handoff workflow',
      'Real project files included',
      'Portfolio-ready projects',
    ],
    isPublished: true,
  },
  {
    id: 'course-8',
    slug: 'ux-research-strategy',
    title: 'UX Research & Strategy',
    shortDescription:
      'Conduct user research, build personas, and craft data-driven UX strategies.',
    description: `Learn the full UX research toolkit — user interviews, surveys, usability testing, journey mapping, and persona creation. This course bridges the gap between user needs and product design.

You will create a complete UX research plan, conduct real user interviews, and synthesize findings into actionable design recommendations.

Perfect for aspiring UX designers, product managers, and anyone who wants to build user-centered products.`,
    price: 1799,
    discountPrice: 899,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&h=340&fit=crop',
    instructor: {
      name: 'Rohan Kapoor',
      bio: 'UX Research Lead at a top-10 Indian startup. Certified usability analyst.',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    },
    difficultyLevel: 'Intermediate',
    durationHours: 24,
    enrollmentCount: 1560,
    ratingAvg: 4.6,
    category: 'ui-ux-design',
    syllabus: [
      {
        title: 'Research Methods',
        lessons: [
          { title: 'User Interviews', duration: '22:00' },
          { title: 'Surveys & Questionnaires', duration: '18:30' },
          { title: 'Usability Testing', duration: '26:00' },
        ],
      },
      {
        title: 'Synthesis & Strategy',
        lessons: [
          { title: 'Affinity Mapping', duration: '20:00' },
          { title: 'Personas & Journey Maps', duration: '24:15' },
          { title: 'UX Strategy Framework', duration: '28:30' },
        ],
      },
    ],
    features: [
      'Real user interview practice',
      'Research templates included',
      'Journey mapping exercises',
      'Stakeholder presentation skills',
      'Portfolio case study project',
      'Certificate of completion',
    ],
    isPublished: true,
  },
  {
    id: 'course-9',
    slug: 'aws-cloud-practitioner-devops',
    title: 'AWS Cloud Practitioner to DevOps Pro',
    shortDescription:
      'Go from cloud beginner to DevOps professional with hands-on AWS labs.',
    description: `Start with AWS Cloud Practitioner fundamentals and progress through Solutions Architect concepts to DevOps engineering. Covers EC2, S3, Lambda, RDS, CloudFormation, CI/CD pipelines, Docker, Kubernetes, and Terraform.

Every module includes hands-on labs in a real AWS environment. You will build a fully automated CI/CD pipeline deploying a containerized microservice.

Prepares you for AWS Cloud Practitioner and Solutions Architect Associate certifications.`,
    price: 2999,
    discountPrice: 1599,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=340&fit=crop',
    instructor: {
      name: 'Vikram Singh',
      bio: 'AWS Solutions Architect Professional. 12+ years in cloud infrastructure and DevOps.',
      avatar: 'https://randomuser.me/api/portraits/men/62.jpg',
    },
    difficultyLevel: 'Beginner',
    durationHours: 48,
    enrollmentCount: 4500,
    ratingAvg: 4.8,
    category: 'cloud-devops',
    syllabus: [
      {
        title: 'Cloud Fundamentals',
        lessons: [
          { title: 'Cloud Computing Concepts', duration: '15:00' },
          { title: 'AWS Global Infrastructure', duration: '20:30' },
          { title: 'IAM & Security', duration: '25:00' },
        ],
      },
      {
        title: 'Core Services',
        lessons: [
          { title: 'EC2 & VPC', duration: '32:00' },
          { title: 'S3 & CloudFront', duration: '24:15' },
          { title: 'RDS & DynamoDB', duration: '28:30' },
          { title: 'Lambda & API Gateway', duration: '30:00' },
        ],
      },
      {
        title: 'DevOps Pipeline',
        lessons: [
          { title: 'Docker & Containers', duration: '35:00' },
          { title: 'Kubernetes on EKS', duration: '38:20' },
          { title: 'CI/CD with CodePipeline', duration: '30:45' },
          { title: 'Infrastructure as Code (Terraform)', duration: '32:00' },
        ],
      },
    ],
    features: [
      'Hands-on AWS labs',
      'Certification prep material',
      'Docker & Kubernetes',
      'Terraform IaC',
      'CI/CD pipeline project',
      'Lifetime access with updates',
    ],
    isPublished: true,
  },
  {
    id: 'course-10',
    slug: 'docker-kubernetes-production',
    title: 'Docker & Kubernetes in Production',
    shortDescription:
      'Containerize apps, orchestrate with Kubernetes, and deploy production-grade clusters.',
    description: `Learn container fundamentals with Docker and graduate to orchestrating multi-container applications with Kubernetes. This course focuses on production scenarios — networking, storage, security, monitoring, and scaling.

You will deploy a microservices-based e-commerce system on a managed Kubernetes cluster with Helm charts, Istio service mesh, and Prometheus monitoring.

Designed for developers and DevOps engineers moving to container-first architecture.`,
    price: 2299,
    discountPrice: 1199,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600&h=340&fit=crop',
    instructor: {
      name: 'Nisha Agarwal',
      bio: 'Platform engineer specializing in Kubernetes. CNCF ambassador and KubeCon speaker.',
      avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
    },
    difficultyLevel: 'Advanced',
    durationHours: 36,
    enrollmentCount: 1980,
    ratingAvg: 4.7,
    category: 'cloud-devops',
    syllabus: [
      {
        title: 'Docker Deep Dive',
        lessons: [
          { title: 'Images & Containers', duration: '22:00' },
          { title: 'Networking & Volumes', duration: '26:30' },
          { title: 'Multi-stage Builds', duration: '18:00' },
        ],
      },
      {
        title: 'Kubernetes Core',
        lessons: [
          { title: 'Pods, Deployments, Services', duration: '30:00' },
          { title: 'ConfigMaps & Secrets', duration: '20:15' },
          { title: 'Persistent Storage', duration: '24:30' },
        ],
      },
      {
        title: 'Production Ops',
        lessons: [
          { title: 'Helm Charts', duration: '28:00' },
          { title: 'Monitoring with Prometheus', duration: '32:45' },
          { title: 'Service Mesh (Istio)', duration: '30:00' },
        ],
      },
    ],
    features: [
      'Production-grade patterns',
      'Helm & Kustomize',
      'Service mesh with Istio',
      'Monitoring & alerting',
      'Security best practices',
      'Microservices project',
    ],
    isPublished: true,
  },
  {
    id: 'course-11',
    slug: 'deep-learning-transformers',
    title: 'Deep Learning & Transformers',
    shortDescription:
      'Master neural networks, CNNs, RNNs, and transformers powering modern AI.',
    description: `Explore the mathematics and implementation of deep learning architectures. Starting with perceptrons and backpropagation, you will progress through CNNs for vision, RNNs/LSTMs for sequences, and the transformer architecture powering GPT and BERT.

Hands-on projects include image classification, sentiment analysis, and building a small language model from scratch using PyTorch.

Prerequisites: Python proficiency and basic linear algebra.`,
    price: 2999,
    discountPrice: 1699,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=340&fit=crop',
    instructor: {
      name: 'Dr. Kavita Nair',
      bio: 'AI researcher with publications at NeurIPS and ICML. Previously at DeepMind.',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
    difficultyLevel: 'Advanced',
    durationHours: 52,
    enrollmentCount: 2760,
    ratingAvg: 4.9,
    category: 'ai-ml',
    syllabus: [
      {
        title: 'Neural Network Fundamentals',
        lessons: [
          { title: 'Perceptrons & Activation Functions', duration: '20:00' },
          { title: 'Backpropagation Math', duration: '30:30' },
          { title: 'PyTorch Basics', duration: '25:00' },
        ],
      },
      {
        title: 'CNNs & Vision',
        lessons: [
          { title: 'Convolution & Pooling', duration: '28:00' },
          { title: 'Transfer Learning', duration: '24:15' },
          { title: 'Object Detection', duration: '32:30' },
        ],
      },
      {
        title: 'Sequences & Transformers',
        lessons: [
          { title: 'RNNs & LSTMs', duration: '30:00' },
          { title: 'Attention Mechanism', duration: '35:20' },
          { title: 'Transformer Architecture', duration: '40:00' },
          { title: 'Building a Mini-GPT', duration: '45:00' },
        ],
      },
    ],
    features: [
      'Math-first approach',
      'PyTorch from scratch',
      'CNN & transformer projects',
      'Build a mini language model',
      'GPU training on Colab',
      'Research paper walkthroughs',
    ],
    isPublished: true,
  },
  {
    id: 'course-12',
    slug: 'generative-ai-langchain',
    title: 'Generative AI & LangChain Applications',
    shortDescription:
      'Build production AI apps with LangChain, RAG, vector databases, and LLM APIs.',
    description: `Learn to build real-world generative AI applications using LangChain, OpenAI APIs, vector databases (Pinecone, ChromaDB), and retrieval-augmented generation (RAG). This course covers prompt engineering, chains, agents, memory, and deploying AI apps.

Projects include a document Q&A chatbot, an AI writing assistant, and a multi-agent research tool.

Stay ahead of the AI curve with the most in-demand skills of the decade.`,
    price: 2499,
    discountPrice: 1399,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1684391962950-73a4524f9056?w=600&h=340&fit=crop',
    instructor: {
      name: 'Arjun Das',
      bio: 'AI engineer and GenAI consultant. Built AI products serving 500K+ users.',
      avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
    },
    difficultyLevel: 'Intermediate',
    durationHours: 34,
    enrollmentCount: 3890,
    ratingAvg: 4.8,
    category: 'ai-ml',
    syllabus: [
      {
        title: 'GenAI Foundations',
        lessons: [
          { title: 'LLM Landscape & APIs', duration: '18:00' },
          { title: 'Prompt Engineering', duration: '24:30' },
          { title: 'LangChain Basics', duration: '22:00' },
        ],
      },
      {
        title: 'RAG & Vector Databases',
        lessons: [
          { title: 'Embeddings & Vector Stores', duration: '28:00' },
          { title: 'Document Loaders & Splitters', duration: '20:15' },
          { title: 'RAG Pipeline', duration: '32:30' },
        ],
      },
      {
        title: 'Agents & Deployment',
        lessons: [
          { title: 'LangChain Agents', duration: '30:00' },
          { title: 'Memory & Conversation', duration: '22:45' },
          { title: 'Deploying AI Apps', duration: '26:00' },
        ],
      },
    ],
    features: [
      'OpenAI & open-source LLMs',
      'RAG with vector databases',
      'LangChain agents & tools',
      'Production deployment',
      '3 complete AI projects',
      'Prompt engineering mastery',
    ],
    isPublished: true,
  },
];

// ─── Testimonials ───
export const testimonials = [
  {
    id: 't1',
    name: 'Aditya Kumar',
    role: 'Frontend Developer at TCS',
    content:
      'The React & Next.js Masterclass completely transformed my career. I went from a junior dev to landing a senior role within 6 months. The project-based approach made all the difference.',
    avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
    rating: 5,
  },
  {
    id: 't2',
    name: 'Fatima Sheikh',
    role: 'Data Analyst at Flipkart',
    content:
      'The Python for Data Science course was exactly what I needed. Dr. Verma explains complex ML concepts with such clarity. I now use these skills daily in my analytics role.',
    avatar: 'https://randomuser.me/api/portraits/women/23.jpg',
    rating: 5,
  },
  {
    id: 't3',
    name: 'Raj Malhotra',
    role: 'Freelance Mobile Developer',
    content:
      'I built my first client app during the React Native course. The instructor anticipates every question. Now I earn ₹80K/month freelancing — this course paid for itself 100x over.',
    avatar: 'https://randomuser.me/api/portraits/men/29.jpg',
    rating: 5,
  },
  {
    id: 't4',
    name: 'Divya Prakash',
    role: 'UX Designer at Razorpay',
    content:
      'The Figma Masterclass took my design skills to the next level. The design system module alone was worth the price. I reference the course materials almost every week.',
    avatar: 'https://randomuser.me/api/portraits/women/42.jpg',
    rating: 4,
  },
  {
    id: 't5',
    name: 'Sanjay Tiwari',
    role: 'DevOps Engineer at Infosys',
    content:
      'The AWS & DevOps course is incredibly thorough. The hands-on labs made cloud concepts click instantly. I cleared my AWS certification on the first attempt thanks to this course.',
    avatar: 'https://randomuser.me/api/portraits/men/56.jpg',
    rating: 5,
  },
  {
    id: 't6',
    name: 'Neha Sharma',
    role: 'ML Engineer at a Startup',
    content:
      "Dr. Kavita's Deep Learning course is outstanding. Building a mini-GPT from scratch was an incredible experience. This course bridges theory and practice perfectly.",
    avatar: 'https://randomuser.me/api/portraits/women/38.jpg',
    rating: 5,
  },
  {
    id: 't7',
    name: 'Vivek Chauhan',
    role: 'Full-Stack Developer',
    content:
      'The JavaScript Design Patterns course made me rethink how I write code. My PRs are now consistently praised for clean architecture. An absolute must for senior devs.',
    avatar: 'https://randomuser.me/api/portraits/men/72.jpg',
    rating: 4,
  },
  {
    id: 't8',
    name: 'Pooja Iyer',
    role: 'Product Manager at Zoho',
    content:
      'As a PM, the UX Research course gave me frameworks to champion user-centered design in my team. The interview practice sessions were incredibly valuable.',
    avatar: 'https://randomuser.me/api/portraits/women/51.jpg',
    rating: 5,
  },
];

// ─── FAQ ───
export const faqItems = [
  {
    question: 'How do I access my courses after purchase?',
    answer:
      'After completing your purchase, you will receive LMS login credentials via email within 5 minutes. Use these credentials at the LMS Login page to access your dashboard and all enrolled courses instantly.',
  },
  {
    question: 'Are the courses self-paced or live?',
    answer:
      'Our courses combine pre-recorded, self-paced video lessons with scheduled live classes and Q&A sessions. You can watch the recorded content anytime, and live sessions are scheduled on weekends for maximum convenience.',
  },
  {
    question: 'Do I get a certificate after completion?',
    answer:
      'Yes! Upon completing all modules and assignments for a course, you receive a verifiable digital certificate that you can share on LinkedIn and include in your resume.',
  },
  {
    question: 'What is the refund policy?',
    answer:
      'We offer a 7-day money-back guarantee on all courses. If you are not satisfied with the course content, contact our support team within 7 days of purchase for a full refund — no questions asked.',
  },
  {
    question: 'Can I access courses on mobile devices?',
    answer:
      'Absolutely! Our LMS is fully responsive and works beautifully on smartphones, tablets, and desktops. You can learn on the go, and your progress syncs seamlessly across all devices.',
  },
  {
    question: 'How long do I have access to a purchased course?',
    answer:
      'You get lifetime access to every course you purchase. This includes all future updates and new content added to the course at no extra charge.',
  },
  {
    question: 'Are there any prerequisites for the courses?',
    answer:
      'Each course page clearly lists prerequisites. Beginner courses have no prior knowledge requirements, while intermediate and advanced courses may require foundational skills explained in the course description.',
  },
  {
    question: 'How do live classes work?',
    answer:
      'Live classes are conducted via our integrated video platform. You will see upcoming live classes on your LMS dashboard with a countdown timer. Click "Join" at the scheduled time to enter the live session where you can interact with the instructor in real-time.',
  },
];

// ─── Platform Stats ───
export const stats = {
  students: 1000,
  courses: 50,
  liveClasses: 200,
  instructors: 25,
};

// ─── Mock Enrolled Courses (for LMS dashboard) ───
export const enrolledCourses = [
  {
    ...courses[0],
    progress: 65,
    lastAccessed: '2026-05-26T10:30:00',
    status: 'in-progress',
    completedLessons: 8,
    totalLessons: 15,
  },
  {
    ...courses[2],
    progress: 30,
    lastAccessed: '2026-05-25T14:15:00',
    status: 'in-progress',
    completedLessons: 3,
    totalLessons: 10,
  },
  {
    ...courses[8],
    progress: 100,
    lastAccessed: '2026-05-20T09:00:00',
    status: 'completed',
    completedLessons: 11,
    totalLessons: 11,
  },
];

// ─── Mock Notifications ───
export const notifications = [
  {
    id: 'n1',
    type: 'live-class',
    title: 'Live Class Tomorrow',
    message: 'React Advanced Patterns — live Q&A session starts tomorrow at 7 PM IST.',
    time: '2026-05-27T14:00:00',
    read: false,
  },
  {
    id: 'n2',
    type: 'course-update',
    title: 'New Module Added',
    message: 'Module 5 "Server Actions" has been added to Complete React & Next.js Masterclass.',
    time: '2026-05-26T09:30:00',
    read: false,
  },
  {
    id: 'n3',
    type: 'achievement',
    title: 'Certificate Earned! 🎉',
    message: 'Congratulations! You have earned your AWS Cloud Practitioner to DevOps Pro certificate.',
    time: '2026-05-20T11:00:00',
    read: true,
  },
  {
    id: 'n4',
    type: 'reminder',
    title: 'Continue Learning',
    message: "You haven't visited Python for Data Science in 2 days. Keep the streak alive!",
    time: '2026-05-25T08:00:00',
    read: true,
  },
  {
    id: 'n5',
    type: 'system',
    title: 'Platform Maintenance',
    message: 'Scheduled maintenance on June 1st from 2 AM to 4 AM IST. No downtime expected.',
    time: '2026-05-24T16:00:00',
    read: true,
  },
];

// ─── Mock User Profile ───
export const userProfile = {
  firstName: 'Amit',
  lastName: 'Deshpande',
  email: 'amit.deshpande@email.com',
  phone: '+91 98765 43210',
  avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
  memberSince: '2026-01-15',
  lmsUsername: 'amit_d_2026',
};

// ─── Upcoming Live Classes ───
export const upcomingLiveClasses = [
  {
    id: 'lc1',
    title: 'React Advanced Patterns — Live Q&A',
    course: 'Complete React & Next.js Masterclass',
    date: '2026-05-28T19:00:00',
    duration: '60 min',
    instructor: 'Aarav Sharma',
  },
  {
    id: 'lc2',
    title: 'Pandas Workshop — Real Dataset Analysis',
    course: 'Python for Data Science & Machine Learning',
    date: '2026-05-30T18:00:00',
    duration: '90 min',
    instructor: 'Dr. Rahul Verma',
  },
  {
    id: 'lc3',
    title: 'AWS EC2 Hands-On Lab',
    course: 'AWS Cloud Practitioner to DevOps Pro',
    date: '2026-06-01T17:00:00',
    duration: '120 min',
    instructor: 'Vikram Singh',
  },
];
