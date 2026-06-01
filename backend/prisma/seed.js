const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...\n');

  // ─── Clear existing data ────────────────────────────────────────────
  await prisma.notification.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.recording.deleteMany();
  await prisma.liveClass.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.lmsCredential.deleteMany();
  await prisma.generalUser.deleteMany();

  console.log('🗑️  Cleared existing data.\n');

  // ─── 1. Create Categories ──────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Web Development',
        slug: 'web-development',
        description: 'Learn modern web development with HTML, CSS, JavaScript, React, Node.js and more.',
        iconUrl: '/icons/web-dev.svg',
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Data Science',
        slug: 'data-science',
        description: 'Master data analysis, visualization, statistics, and machine learning with Python and R.',
        iconUrl: '/icons/data-science.svg',
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'AI & Machine Learning',
        slug: 'ai-machine-learning',
        description: 'Explore artificial intelligence, deep learning, NLP, and computer vision technologies.',
        iconUrl: '/icons/ai-ml.svg',
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Mobile Development',
        slug: 'mobile-development',
        description: 'Build native and cross-platform mobile apps for Android and iOS.',
        iconUrl: '/icons/mobile-dev.svg',
        sortOrder: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: 'UI/UX Design',
        slug: 'ui-ux-design',
        description: 'Design beautiful user interfaces and create seamless user experiences.',
        iconUrl: '/icons/ui-ux.svg',
        sortOrder: 5,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Digital Marketing',
        slug: 'digital-marketing',
        description: 'Master SEO, social media marketing, Google Ads, content marketing and analytics.',
        iconUrl: '/icons/digital-marketing.svg',
        sortOrder: 6,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories.\n`);

  // ─── 2. Create Courses (2 per category = 12 total) ─────────────────
  const courseData = [
    // Web Development
    {
      categoryId: categories[0].id,
      title: 'Full Stack Web Development with MERN Stack',
      slug: 'full-stack-mern-development',
      description: 'Master the MERN stack (MongoDB, Express.js, React, Node.js) from scratch. Build real-world projects including an e-commerce platform, social media app, and portfolio website. Learn authentication, REST APIs, state management, and deployment.',
      shortDescription: 'Complete MERN stack bootcamp - from zero to full stack developer',
      price: 2999,
      discountPrice: 1499,
      thumbnailUrl: '/thumbnails/mern-stack.jpg',
      previewVideoUrl: '/previews/mern-stack-intro.mp4',
      difficultyLevel: 'INTERMEDIATE',
      durationHours: 48,
      instructorName: 'Rahul Sharma',
      instructorBio: 'Senior Full Stack Developer with 8+ years of experience at top tech companies. Built 50+ production applications.',
      instructorAvatar: '/avatars/rahul-sharma.jpg',
      syllabus: JSON.stringify([
        { week: 1, title: 'HTML5 & CSS3 Foundations', topics: ['Semantic HTML', 'Flexbox & Grid', 'Responsive Design', 'CSS Animations'] },
        { week: 2, title: 'JavaScript Deep Dive', topics: ['ES6+', 'Async/Await', 'DOM Manipulation', 'Event Handling'] },
        { week: 3, title: 'React.js Fundamentals', topics: ['Components', 'Hooks', 'State Management', 'React Router'] },
        { week: 4, title: 'Advanced React', topics: ['Context API', 'Redux Toolkit', 'Custom Hooks', 'Performance Optimization'] },
        { week: 5, title: 'Node.js & Express.js', topics: ['REST APIs', 'Middleware', 'Authentication', 'File Uploads'] },
        { week: 6, title: 'MongoDB & Deployment', topics: ['Mongoose', 'Aggregation', 'AWS/Vercel Deployment', 'CI/CD'] },
      ]),
      features: JSON.stringify(['48+ hours of HD video', '15 real-world projects', 'Lifetime access', 'Certificate of completion', 'Discord community access', '1-on-1 doubt resolution']),
      enrollmentCount: 1245,
      ratingAvg: 4.7,
    },
    {
      categoryId: categories[0].id,
      title: 'Next.js 14 - Complete Production Guide',
      slug: 'nextjs-14-production-guide',
      description: 'Build production-ready applications with Next.js 14. Learn App Router, Server Components, Server Actions, streaming, caching strategies, and deployment. Includes building a complete SaaS platform.',
      shortDescription: 'Build production-grade apps with Next.js 14 and React Server Components',
      price: 1999,
      discountPrice: 999,
      thumbnailUrl: '/thumbnails/nextjs-14.jpg',
      previewVideoUrl: '/previews/nextjs-intro.mp4',
      difficultyLevel: 'ADVANCED',
      durationHours: 32,
      instructorName: 'Priya Patel',
      instructorBio: 'Frontend architect and Next.js contributor. Google Developer Expert in Web Technologies.',
      instructorAvatar: '/avatars/priya-patel.jpg',
      syllabus: JSON.stringify([
        { week: 1, title: 'Next.js 14 Fundamentals', topics: ['App Router', 'Layouts', 'Loading UI', 'Error Handling'] },
        { week: 2, title: 'Server Components & Actions', topics: ['RSC', 'Server Actions', 'Data Fetching', 'Caching'] },
        { week: 3, title: 'Authentication & Database', topics: ['NextAuth.js', 'Prisma', 'PostgreSQL', 'Middleware'] },
        { week: 4, title: 'SaaS Platform Project', topics: ['Stripe Integration', 'Dashboard', 'Admin Panel', 'Deployment'] },
      ]),
      features: JSON.stringify(['32+ hours of content', 'SaaS platform project', 'Source code included', 'Lifetime updates']),
      enrollmentCount: 876,
      ratingAvg: 4.8,
    },
    // Data Science
    {
      categoryId: categories[1].id,
      title: 'Data Science & Analytics with Python',
      slug: 'data-science-python-analytics',
      description: 'Complete data science course covering Python, NumPy, Pandas, Matplotlib, Seaborn, SQL, and statistical analysis. Work on real datasets from Kaggle and build a portfolio of data analysis projects.',
      shortDescription: 'From Python basics to advanced data analysis and visualization',
      price: 2499,
      discountPrice: 1299,
      thumbnailUrl: '/thumbnails/data-science-python.jpg',
      previewVideoUrl: '/previews/data-science-intro.mp4',
      difficultyLevel: 'BEGINNER',
      durationHours: 40,
      instructorName: 'Dr. Ankit Verma',
      instructorBio: 'PhD in Statistics, former Data Scientist at Amazon. Published researcher with 15+ papers.',
      instructorAvatar: '/avatars/ankit-verma.jpg',
      syllabus: JSON.stringify([
        { week: 1, title: 'Python for Data Science', topics: ['Python Basics', 'NumPy', 'Data Types', 'Functions'] },
        { week: 2, title: 'Pandas & Data Wrangling', topics: ['DataFrames', 'Cleaning', 'Merging', 'Groupby'] },
        { week: 3, title: 'Data Visualization', topics: ['Matplotlib', 'Seaborn', 'Plotly', 'Dashboard Creation'] },
        { week: 4, title: 'Statistics & SQL', topics: ['Hypothesis Testing', 'Regression', 'SQL Queries', 'Database Design'] },
        { week: 5, title: 'Capstone Projects', topics: ['EDA Projects', 'Business Analytics', 'Portfolio Building'] },
      ]),
      features: JSON.stringify(['40+ hours of video', '10 real-world datasets', 'Kaggle competitions', 'Interview preparation']),
      enrollmentCount: 2100,
      ratingAvg: 4.6,
    },
    {
      categoryId: categories[1].id,
      title: 'Advanced SQL & Database Engineering',
      slug: 'advanced-sql-database-engineering',
      description: 'Master advanced SQL queries, database design, performance optimization, and data engineering. Learn PostgreSQL, MySQL, indexing, stored procedures, and ETL pipelines.',
      shortDescription: 'Expert-level SQL and database architecture for data professionals',
      price: 1799,
      discountPrice: 899,
      thumbnailUrl: '/thumbnails/advanced-sql.jpg',
      difficultyLevel: 'ADVANCED',
      durationHours: 28,
      instructorName: 'Kavita Deshmukh',
      instructorBio: 'Database Architect with 12 years of experience. Ex-Oracle and Microsoft.',
      instructorAvatar: '/avatars/kavita-deshmukh.jpg',
      syllabus: JSON.stringify([
        { week: 1, title: 'Advanced SQL Queries', topics: ['Window Functions', 'CTEs', 'Recursive Queries', 'Subqueries'] },
        { week: 2, title: 'Database Design', topics: ['Normalization', 'ER Diagrams', 'Partitioning', 'Sharding'] },
        { week: 3, title: 'Performance & Optimization', topics: ['Indexing', 'Query Plans', 'Caching', 'Monitoring'] },
        { week: 4, title: 'Data Engineering', topics: ['ETL Pipelines', 'Data Warehousing', 'dbt', 'Airflow'] },
      ]),
      features: JSON.stringify(['28+ hours of content', 'Real database scenarios', 'Performance labs', 'Certificate']),
      enrollmentCount: 654,
      ratingAvg: 4.5,
    },
    // AI & Machine Learning
    {
      categoryId: categories[2].id,
      title: 'Machine Learning A-Z: From Basics to Mastery',
      slug: 'machine-learning-basics-to-mastery',
      description: 'Comprehensive machine learning course covering supervised, unsupervised, and reinforcement learning. Implement algorithms from scratch and using scikit-learn, TensorFlow. Build 10+ ML projects.',
      shortDescription: 'Complete machine learning journey with hands-on projects',
      price: 2999,
      discountPrice: 1599,
      thumbnailUrl: '/thumbnails/ml-az.jpg',
      previewVideoUrl: '/previews/ml-intro.mp4',
      difficultyLevel: 'INTERMEDIATE',
      durationHours: 52,
      instructorName: 'Prof. Sanjay Gupta',
      instructorBio: 'ML Research Scientist, IIT Delhi Professor. 20+ years in AI/ML research and teaching.',
      instructorAvatar: '/avatars/sanjay-gupta.jpg',
      syllabus: JSON.stringify([
        { week: 1, title: 'ML Foundations', topics: ['Linear Algebra', 'Probability', 'Python Setup', 'Data Preprocessing'] },
        { week: 2, title: 'Supervised Learning', topics: ['Linear Regression', 'Logistic Regression', 'SVM', 'Decision Trees'] },
        { week: 3, title: 'Ensemble Methods', topics: ['Random Forest', 'XGBoost', 'Bagging', 'Boosting'] },
        { week: 4, title: 'Unsupervised Learning', topics: ['K-Means', 'PCA', 'DBSCAN', 'Anomaly Detection'] },
        { week: 5, title: 'Neural Networks', topics: ['Perceptrons', 'Backpropagation', 'TensorFlow', 'Keras'] },
        { week: 6, title: 'ML in Production', topics: ['Model Deployment', 'MLOps', 'A/B Testing', 'Monitoring'] },
      ]),
      features: JSON.stringify(['52+ hours of video', '10+ ML projects', 'Math foundations', 'Industry case studies', 'Job placement support']),
      enrollmentCount: 3200,
      ratingAvg: 4.9,
    },
    {
      categoryId: categories[2].id,
      title: 'Deep Learning & Generative AI with Python',
      slug: 'deep-learning-generative-ai',
      description: 'Learn deep learning, CNNs, RNNs, Transformers, GANs, and Generative AI. Build projects with PyTorch, implement attention mechanisms, and create your own GPT-style model.',
      shortDescription: 'Master deep learning and build Generative AI applications',
      price: 2499,
      discountPrice: 1799,
      thumbnailUrl: '/thumbnails/deep-learning-genai.jpg',
      difficultyLevel: 'ADVANCED',
      durationHours: 45,
      instructorName: 'Dr. Meera Krishnan',
      instructorBio: 'AI Researcher at Google Brain. Published 30+ papers on deep learning and NLP.',
      instructorAvatar: '/avatars/meera-krishnan.jpg',
      syllabus: JSON.stringify([
        { week: 1, title: 'Deep Learning Fundamentals', topics: ['Neural Networks', 'Activation Functions', 'Optimizers', 'PyTorch'] },
        { week: 2, title: 'CNNs & Computer Vision', topics: ['Convolutions', 'ResNet', 'Object Detection', 'Image Generation'] },
        { week: 3, title: 'RNNs & NLP', topics: ['LSTM', 'GRU', 'Word Embeddings', 'Sequence Models'] },
        { week: 4, title: 'Transformers & Attention', topics: ['Self-Attention', 'BERT', 'GPT Architecture', 'Fine-tuning'] },
        { week: 5, title: 'Generative AI', topics: ['GANs', 'VAEs', 'Diffusion Models', 'LLM Applications'] },
      ]),
      features: JSON.stringify(['45+ hours of content', 'GPU-powered labs', 'Research paper discussions', 'Build your own GPT']),
      enrollmentCount: 1560,
      ratingAvg: 4.8,
    },
    // Mobile Development
    {
      categoryId: categories[3].id,
      title: 'React Native - Build Mobile Apps for iOS & Android',
      slug: 'react-native-mobile-apps',
      description: 'Build cross-platform mobile apps with React Native. Learn navigation, state management, native modules, push notifications, and app store deployment. Build 5 complete apps.',
      shortDescription: 'Cross-platform mobile development with React Native and Expo',
      price: 1999,
      discountPrice: 999,
      thumbnailUrl: '/thumbnails/react-native.jpg',
      previewVideoUrl: '/previews/react-native-intro.mp4',
      difficultyLevel: 'INTERMEDIATE',
      durationHours: 36,
      instructorName: 'Arjun Mehta',
      instructorBio: 'Mobile developer with 6+ years experience. Built apps with 1M+ downloads on both platforms.',
      instructorAvatar: '/avatars/arjun-mehta.jpg',
      syllabus: JSON.stringify([
        { week: 1, title: 'React Native Basics', topics: ['Expo Setup', 'Components', 'Styling', 'Flexbox'] },
        { week: 2, title: 'Navigation & State', topics: ['React Navigation', 'Redux', 'AsyncStorage', 'Forms'] },
        { week: 3, title: 'APIs & Backend', topics: ['REST APIs', 'Firebase', 'Authentication', 'Push Notifications'] },
        { week: 4, title: 'Advanced Features', topics: ['Animations', 'Camera', 'Maps', 'Native Modules'] },
        { week: 5, title: 'Deployment', topics: ['App Store', 'Play Store', 'CodePush', 'Analytics'] },
      ]),
      features: JSON.stringify(['36+ hours of video', '5 complete apps', 'Both iOS & Android', 'Store deployment guide']),
      enrollmentCount: 980,
      ratingAvg: 4.6,
    },
    {
      categoryId: categories[3].id,
      title: 'Flutter & Dart - The Complete Guide',
      slug: 'flutter-dart-complete-guide',
      description: 'Master Flutter and Dart to build beautiful, natively compiled applications for mobile, web, and desktop from a single codebase. Includes state management, animations, and Firebase integration.',
      shortDescription: 'Build beautiful cross-platform apps with Flutter and Dart',
      price: 1799,
      discountPrice: 899,
      thumbnailUrl: '/thumbnails/flutter-dart.jpg',
      difficultyLevel: 'BEGINNER',
      durationHours: 42,
      instructorName: 'Sneha Reddy',
      instructorBio: 'Google Developer Expert for Flutter. Speaker at Flutter conferences worldwide.',
      instructorAvatar: '/avatars/sneha-reddy.jpg',
      syllabus: JSON.stringify([
        { week: 1, title: 'Dart Programming', topics: ['Variables', 'OOP', 'Async', 'Collections'] },
        { week: 2, title: 'Flutter Basics', topics: ['Widgets', 'Layouts', 'Navigation', 'Theming'] },
        { week: 3, title: 'State Management', topics: ['Provider', 'Riverpod', 'BLoC', 'GetX'] },
        { week: 4, title: 'Backend Integration', topics: ['Firebase', 'REST APIs', 'Local Storage', 'Auth'] },
        { week: 5, title: 'Advanced Flutter', topics: ['Animations', 'Custom Painters', 'Platform Channels', 'Testing'] },
      ]),
      features: JSON.stringify(['42+ hours of content', '8 projects', 'Material Design', 'Web & desktop support']),
      enrollmentCount: 1320,
      ratingAvg: 4.7,
    },
    // UI/UX Design
    {
      categoryId: categories[4].id,
      title: 'Complete UI/UX Design Bootcamp with Figma',
      slug: 'ui-ux-design-bootcamp-figma',
      description: 'Learn UI/UX design from scratch using Figma. Cover user research, wireframing, prototyping, design systems, accessibility, and portfolio building. Land your first design job.',
      shortDescription: 'Become a professional UI/UX designer with Figma',
      price: 1499,
      discountPrice: 799,
      thumbnailUrl: '/thumbnails/ui-ux-figma.jpg',
      previewVideoUrl: '/previews/ui-ux-intro.mp4',
      difficultyLevel: 'BEGINNER',
      durationHours: 30,
      instructorName: 'Nidhi Agarwal',
      instructorBio: 'Senior Product Designer at Swiggy. Previously designed for Flipkart and Ola.',
      instructorAvatar: '/avatars/nidhi-agarwal.jpg',
      syllabus: JSON.stringify([
        { week: 1, title: 'Design Foundations', topics: ['Design Principles', 'Color Theory', 'Typography', 'Layout'] },
        { week: 2, title: 'UX Research', topics: ['User Personas', 'Journey Mapping', 'Wireframing', 'Information Architecture'] },
        { week: 3, title: 'Figma Mastery', topics: ['Components', 'Auto Layout', 'Variants', 'Prototyping'] },
        { week: 4, title: 'Design Systems', topics: ['Tokens', 'Component Library', 'Documentation', 'Handoff'] },
      ]),
      features: JSON.stringify(['30+ hours of video', 'Figma project files', 'Portfolio projects', 'Design community access']),
      enrollmentCount: 1890,
      ratingAvg: 4.8,
    },
    {
      categoryId: categories[4].id,
      title: 'Advanced Motion Design & Micro-interactions',
      slug: 'advanced-motion-design-interactions',
      description: 'Master animation principles for digital products. Learn to create engaging micro-interactions, page transitions, and motion systems using Figma, After Effects, and Lottie.',
      shortDescription: 'Create stunning animations and micro-interactions for apps and websites',
      price: 1299,
      discountPrice: 699,
      thumbnailUrl: '/thumbnails/motion-design.jpg',
      difficultyLevel: 'ADVANCED',
      durationHours: 24,
      instructorName: 'Rohan Kapoor',
      instructorBio: 'Motion designer and creative director. Worked with brands like Nike, Apple, and Google.',
      instructorAvatar: '/avatars/rohan-kapoor.jpg',
      syllabus: JSON.stringify([
        { week: 1, title: 'Animation Principles', topics: ['12 Principles', 'Timing & Spacing', 'Easing Curves', 'Motion Studies'] },
        { week: 2, title: 'UI Animation', topics: ['Micro-interactions', 'Loading States', 'Page Transitions', 'Gestures'] },
        { week: 3, title: 'Tools & Implementation', topics: ['After Effects', 'Lottie', 'CSS Animations', 'Framer Motion'] },
      ]),
      features: JSON.stringify(['24+ hours of content', 'Project files included', 'Animation library', 'Client project workflow']),
      enrollmentCount: 432,
      ratingAvg: 4.5,
    },
    // Digital Marketing
    {
      categoryId: categories[5].id,
      title: 'Digital Marketing Mastery - Complete Course',
      slug: 'digital-marketing-mastery-complete',
      description: 'Learn all aspects of digital marketing: SEO, Google Ads, Facebook Ads, Instagram marketing, content strategy, email marketing, and analytics. Get Google and Meta certified.',
      shortDescription: 'Master SEO, Google Ads, Social Media, and Content Marketing',
      price: 1999,
      discountPrice: 999,
      thumbnailUrl: '/thumbnails/digital-marketing.jpg',
      previewVideoUrl: '/previews/digital-marketing-intro.mp4',
      difficultyLevel: 'BEGINNER',
      durationHours: 35,
      instructorName: 'Vikram Singh',
      instructorBio: 'Digital marketing consultant with 10+ years experience. Managed ₹50Cr+ in ad spend.',
      instructorAvatar: '/avatars/vikram-singh.jpg',
      syllabus: JSON.stringify([
        { week: 1, title: 'Marketing Foundations', topics: ['Digital Strategy', 'Buyer Personas', 'Funnel Design', 'KPIs'] },
        { week: 2, title: 'SEO Mastery', topics: ['On-Page SEO', 'Technical SEO', 'Link Building', 'Content Strategy'] },
        { week: 3, title: 'Paid Advertising', topics: ['Google Ads', 'Facebook Ads', 'Instagram Ads', 'Remarketing'] },
        { week: 4, title: 'Content & Email', topics: ['Content Marketing', 'Email Automation', 'Copywriting', 'Landing Pages'] },
        { week: 5, title: 'Analytics & Growth', topics: ['Google Analytics', 'Attribution', 'A/B Testing', 'Growth Hacking'] },
      ]),
      features: JSON.stringify(['35+ hours of video', 'Google certification prep', 'Live campaign practice', 'Marketing templates']),
      enrollmentCount: 2340,
      ratingAvg: 4.7,
    },
    {
      categoryId: categories[5].id,
      title: 'YouTube & Video Marketing Masterclass',
      slug: 'youtube-video-marketing-masterclass',
      description: 'Build and grow a successful YouTube channel. Learn video production, SEO optimization, thumbnail design, audience growth, and monetization strategies.',
      shortDescription: 'Grow a profitable YouTube channel from zero subscribers',
      price: 499,
      discountPrice: null,
      thumbnailUrl: '/thumbnails/youtube-marketing.jpg',
      difficultyLevel: 'BEGINNER',
      durationHours: 18,
      instructorName: 'Aisha Khan',
      instructorBio: 'YouTuber with 500K+ subscribers. Helped 200+ creators grow their channels.',
      instructorAvatar: '/avatars/aisha-khan.jpg',
      syllabus: JSON.stringify([
        { week: 1, title: 'Channel Setup', topics: ['Niche Selection', 'Branding', 'Channel Art', 'Equipment'] },
        { week: 2, title: 'Content Creation', topics: ['Scripting', 'Filming', 'Editing', 'Thumbnails'] },
        { week: 3, title: 'Growth & Monetization', topics: ['YouTube SEO', 'Algorithm', 'Monetization', 'Sponsorships'] },
      ]),
      features: JSON.stringify(['18+ hours of content', 'Equipment recommendations', 'Thumbnail templates', 'Growth playbook']),
      enrollmentCount: 876,
      ratingAvg: 4.4,
    },
  ];

  const courses = [];
  for (const data of courseData) {
    const course = await prisma.course.create({ data });
    courses.push(course);
  }

  console.log(`✅ Created ${courses.length} courses.\n`);

  // ─── 3. Create Users ───────────────────────────────────────────────
  const adminPasswordHash = await bcrypt.hash('admin123', 12);
  const userPasswordHash = await bcrypt.hash('user1234', 12);

  const adminUser = await prisma.generalUser.create({
    data: {
      email: 'admin@lms.com',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'LMS',
      phone: '+91-9876543210',
      role: 'ADMIN',
    },
  });

  const user1 = await prisma.generalUser.create({
    data: {
      email: 'rahul@example.com',
      passwordHash: userPasswordHash,
      firstName: 'Rahul',
      lastName: 'Sharma',
      phone: '+91-9876543211',
      role: 'INSTRUCTOR',
    },
  });


  const user2 = await prisma.generalUser.create({
    data: {
      email: 'priya@example.com',
      passwordHash: userPasswordHash,
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '+91-9876543212',
    },
  });

  const user3 = await prisma.generalUser.create({
    data: {
      email: 'amit@example.com',
      passwordHash: userPasswordHash,
      firstName: 'Amit',
      lastName: 'Patel',
      phone: '+91-9876543213',
    },
  });

  console.log('✅ Created 1 admin + 3 sample users.\n');

  // ─── 4. Create LMS Credentials ────────────────────────────────────
  const lmsPassword = await bcrypt.hash('lms12345', 12);

  const lmsCred1 = await prisma.lmsCredential.create({
    data: {
      generalUserId: user1.id,
      lmsUsername: 'rahul4521',
      lmsPasswordHash: lmsPassword,
    },
  });

  const lmsCred2 = await prisma.lmsCredential.create({
    data: {
      generalUserId: user2.id,
      lmsUsername: 'priya7832',
      lmsPasswordHash: lmsPassword,
    },
  });

  const lmsCred3 = await prisma.lmsCredential.create({
    data: {
      generalUserId: user3.id,
      lmsUsername: 'amit9154',
      lmsPasswordHash: lmsPassword,
    },
  });

  console.log('✅ Created 3 LMS credentials.\n');

  // ─── 5. Create Enrollments ─────────────────────────────────────────
  const enrollments = await Promise.all([
    prisma.enrollment.create({
      data: {
        generalUserId: user1.id,
        courseId: courses[0].id, // MERN Stack
        lmsCredentialId: lmsCred1.id,
        paymentStatus: 'COMPLETED',
        amountPaid: 1499,
        progressPercent: 35,
      },
    }),
    prisma.enrollment.create({
      data: {
        generalUserId: user1.id,
        courseId: courses[4].id, // ML A-Z
        lmsCredentialId: lmsCred1.id,
        paymentStatus: 'COMPLETED',
        amountPaid: 1599,
        progressPercent: 15,
      },
    }),
    prisma.enrollment.create({
      data: {
        generalUserId: user2.id,
        courseId: courses[0].id, // MERN Stack
        lmsCredentialId: lmsCred2.id,
        paymentStatus: 'COMPLETED',
        amountPaid: 1499,
        progressPercent: 68,
      },
    }),
    prisma.enrollment.create({
      data: {
        generalUserId: user2.id,
        courseId: courses[8].id, // UI/UX Figma
        lmsCredentialId: lmsCred2.id,
        paymentStatus: 'COMPLETED',
        amountPaid: 799,
        progressPercent: 90,
      },
    }),
    prisma.enrollment.create({
      data: {
        generalUserId: user3.id,
        courseId: courses[2].id, // Data Science
        lmsCredentialId: lmsCred3.id,
        paymentStatus: 'COMPLETED',
        amountPaid: 1299,
        progressPercent: 50,
      },
    }),
  ]);

  console.log(`✅ Created ${enrollments.length} enrollments.\n`);

  // ─── 6. Create Live Classes ────────────────────────────────────────
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 0, 0, 0);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(18, 0, 0, 0);

  const liveClasses = await Promise.all([
    prisma.liveClass.create({
      data: {
        courseId: courses[0].id, // MERN Stack
        title: 'Live Coding: Building a REST API with Express.js',
        description: 'Join us for a hands-on live session where we build a complete REST API from scratch with Express.js, including authentication and error handling.',
        scheduledAt: tomorrow,
        meetingUrl: 'https://meet.google.com/abc-defg-hij',
        status: 'SCHEDULED',
      },
    }),
    prisma.liveClass.create({
      data: {
        courseId: courses[4].id, // ML A-Z
        title: 'Q&A Session: Neural Networks & Backpropagation',
        description: 'Live doubt clearing session on neural networks, gradient descent, and backpropagation algorithm. Bring your questions!',
        scheduledAt: nextWeek,
        meetingUrl: 'https://meet.google.com/klm-nopq-rst',
        status: 'SCHEDULED',
      },
    }),
  ]);

  console.log(`✅ Created ${liveClasses.length} live classes.\n`);

  // ─── 7. Create Recordings ─────────────────────────────────────────
  const recordings = await Promise.all([
    prisma.recording.create({
      data: {
        courseId: courses[0].id, // MERN Stack
        title: 'Week 1: HTML5 Semantic Elements Deep Dive',
        description: 'Complete walkthrough of HTML5 semantic elements, forms, and accessibility best practices.',
        videoUrl: '/videos/mern/week1-html5-semantics.mp4',
        thumbnailUrl: '/thumbnails/recordings/html5-semantics.jpg',
        durationSeconds: 3600,
        status: 'READY',
        sortOrder: 1,
      },
    }),
    prisma.recording.create({
      data: {
        courseId: courses[0].id, // MERN Stack
        title: 'Week 1: CSS Flexbox & Grid Layout Masterclass',
        description: 'Master CSS Flexbox and Grid Layout with practical examples and responsive design patterns.',
        videoUrl: '/videos/mern/week1-flexbox-grid.mp4',
        thumbnailUrl: '/thumbnails/recordings/flexbox-grid.jpg',
        durationSeconds: 4200,
        status: 'READY',
        sortOrder: 2,
      },
    }),
    prisma.recording.create({
      data: {
        courseId: courses[4].id, // ML A-Z
        title: 'Introduction to Machine Learning & Python Setup',
        description: 'Overview of machine learning types, applications, and setting up your Python environment with Jupyter.',
        videoUrl: '/videos/ml/intro-ml-setup.mp4',
        thumbnailUrl: '/thumbnails/recordings/ml-intro.jpg',
        durationSeconds: 2700,
        status: 'READY',
        sortOrder: 1,
      },
    }),
  ]);

  console.log(`✅ Created ${recordings.length} recordings.\n`);

  // ─── 8. Create Sample Notifications ────────────────────────────────
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: lmsCred1.id,
        liveClassId: liveClasses[0].id,
        type: 'LIVE_REMINDER',
        title: '⏰ Upcoming Live Class Tomorrow',
        message: 'Live Coding: Building a REST API with Express.js is scheduled for tomorrow at 7:00 PM.',
      },
    }),
    prisma.notification.create({
      data: {
        userId: lmsCred1.id,
        type: 'RECORDING_UPLOADED',
        title: '📹 New Recording Available',
        message: 'Week 1: HTML5 Semantic Elements Deep Dive has been uploaded for MERN Stack course.',
      },
    }),
    prisma.notification.create({
      data: {
        userId: lmsCred2.id,
        type: 'ANNOUNCEMENT',
        title: '🎉 Welcome to LMS Platform',
        message: 'Thank you for enrolling! Start your learning journey today.',
      },
    }),
  ]);

  console.log('✅ Created sample notifications.\n');

  // ─── Summary ───────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════');
  console.log('  🌱 Seed completed successfully!');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log('  📧 Admin Login:');
  console.log('     Email: admin@lms.com');
  console.log('     Password: admin123');
  console.log('');
  console.log('  📧 Sample User Logins (General):');
  console.log('     Email: rahul@example.com / Password: user1234');
  console.log('     Email: priya@example.com / Password: user1234');
  console.log('     Email: amit@example.com  / Password: user1234');
  console.log('');
  console.log('  🔐 Sample LMS Logins:');
  console.log('     Username: rahul4521 / Password: lms12345');
  console.log('     Username: priya7832 / Password: lms12345');
  console.log('     Username: amit9154  / Password: lms12345');
  console.log('');
  console.log('═══════════════════════════════════════════════════');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
