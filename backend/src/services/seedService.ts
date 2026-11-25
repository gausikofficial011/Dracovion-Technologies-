import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { ServiceCatalog } from '../models/ServiceCatalog';
import { PortfolioItem } from '../models/PortfolioItem';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { encryptEmployeePassword } from '../utils/credentialCrypto';

export async function seedInitialData(): Promise<void> {
  try {
    // Clean up legacy demo and typo placeholder accounts
    await User.deleteMany({
      email: {
        $in: [
          'client@demo.com',
          'karthik@draccovion.com',
          'employee@draccovion.com',
        ],
      },
    });

    // 1. Ensure Super Admin (Gausik Srinivasan) exists
    let superAdmin = await User.findOne({ email: env.SUPER_ADMIN_EMAIL.toLowerCase() });
    if (!superAdmin) {
      const superAdminPassHash = await bcrypt.hash(env.SUPER_ADMIN_PASSWORD, 12);
      superAdmin = await User.create({
        email: env.SUPER_ADMIN_EMAIL.toLowerCase(),
        passwordHash: superAdminPassHash,
        fullName: env.SUPER_ADMIN_NAME,
        role: 'super_admin',
        portalType: 'workspace',
        designation: 'Managing Director & Super Admin',
        department: 'Executive Governance',
        employeeCode: 'DRV-SA-001',
        phone: env.BUSINESS_PHONE,
        avatarUrl: '/dracovion_technologies_ascending_spiral_black_gold.png',
        status: 'active',
        isEmailVerified: true,
      });
      logger.info(`Super Admin initialized: ${env.SUPER_ADMIN_EMAIL}`);
    } else {
      let modified = false;
      if (!superAdmin.avatarUrl || superAdmin.avatarUrl === '/founder-gausik.png') {
        superAdmin.avatarUrl = '/dracovion_technologies_ascending_spiral_black_gold.png';
        modified = true;
      }
      if (!superAdmin.phone || superAdmin.phone === '+91 98401 99999') {
        superAdmin.phone = env.BUSINESS_PHONE;
        modified = true;
      }
      if (modified) {
        await superAdmin.save();
      }
    }

    // 2. Ensure Owner (from INITIAL_OWNER_EMAIL / president@dracovion.com) exists
    const ownerEmail = env.INITIAL_OWNER_EMAIL.toLowerCase();
    let owner = await User.findOne({ email: ownerEmail });
    if (!owner) {
      // Check if legacy founder@dracovion.com exists and migrate it
      const legacyOwner = await User.findOne({ email: 'founder@dracovion.com' });
      if (legacyOwner) {
        legacyOwner.email = ownerEmail;
        legacyOwner.fullName = env.INITIAL_OWNER_NAME || 'Platform President & Owner';
        legacyOwner.passwordHash = await bcrypt.hash(env.INITIAL_OWNER_PASSWORD, 12);
        await legacyOwner.save();
        owner = legacyOwner;
        logger.info(`Migrated legacy owner to ${ownerEmail}`);
      } else {
        const ownerPassHash = await bcrypt.hash(env.INITIAL_OWNER_PASSWORD, 12);
        owner = await User.create({
          email: ownerEmail,
          passwordHash: ownerPassHash,
          fullName: env.INITIAL_OWNER_NAME || 'Platform President & Owner',
          role: 'owner',
          portalType: 'workspace',
          designation: 'Platform President & Owner',
          department: 'Executive Leadership',
          employeeCode: 'DRV-PRESIDENT-001',
          status: 'active',
          isEmailVerified: true,
        });
        logger.info(`Owner account initialized: ${ownerEmail}`);
      }
    }

    // 3. Ensure CEO exists
    const ceoEmail = env.CEO_EMAIL.toLowerCase();
    let ceo = await User.findOne({ email: ceoEmail });
    if (!ceo) {
      const ceoPassHash = await bcrypt.hash(env.CEO_PASSWORD, 12);
      ceo = await User.create({
        email: ceoEmail,
        passwordHash: ceoPassHash,
        fullName: 'Chief Executive Officer',
        role: 'ceo',
        portalType: 'workspace',
        designation: 'Chief Executive Officer',
        department: 'Executive Leadership',
        employeeCode: 'DRV-CEO-001',
        status: 'active',
        isEmailVerified: true,
      });
      logger.info(`CEO account initialized: ${ceoEmail}`);
    }

    // 4. Ensure primary Workspace Employee account (@dracovion.com) exists cleanly without fake payment placeholders
    const empPlainPass = env.INITIAL_EMPLOYEE_PASSWORD;
    const empPassHash = await bcrypt.hash(empPlainPass, 12);
    const encryptedVaultPass = encryptEmployeePassword(empPlainPass);

    const primaryEmployee = {
      email: env.INITIAL_EMPLOYEE_EMAIL.toLowerCase(),
      fullName: 'Dracovion Lead Engineer',
      designation: 'Senior Full Stack Lead & Delivery Architect',
      department: 'Engineering & Delivery',
      employeeCode: 'DRV-EMP-101',
      phone: env.BUSINESS_PHONE,
    };

    const existingEmp = await User.findOne({ email: primaryEmployee.email });
    if (!existingEmp) {
      await User.create({
        ...primaryEmployee,
        passwordHash: empPassHash,
        employeeManagedPassword: encryptedVaultPass,
        role: 'employee',
        portalType: 'workspace',
        status: 'active',
        isEmailVerified: true,
      });
      logger.info(`Employee initialized: ${primaryEmployee.email}`);
    } else {
      let changed = false;
      // Scrub any legacy demo/placeholder values if present
      if (existingEmp.phone === '+91 98401 23456') {
        existingEmp.phone = env.BUSINESS_PHONE;
        changed = true;
      }
      if (
        existingEmp.employeePaymentUpi === 'karthik.dracovion@okaxis' ||
        existingEmp.employeePaymentUpi === 'dracovion.pay@okaxis'
      ) {
        existingEmp.employeePaymentUpi = '';
        changed = true;
      }
      if (existingEmp.employeePaymentBankAccount === '50100492817291 (HDFC Bank)') {
        existingEmp.employeePaymentBankAccount = '';
        changed = true;
      }
      if (existingEmp.employeePaymentIfsc === 'HDFC0001234') {
        existingEmp.employeePaymentIfsc = '';
        changed = true;
      }
      if (!existingEmp.employeeManagedPassword) {
        existingEmp.employeeManagedPassword = encryptedVaultPass;
        changed = true;
      }
      if (changed) {
        await existingEmp.save();
      }
    }

    // 2. Seed Core Services if none exist
    const serviceCount = await ServiceCatalog.countDocuments();
    if (serviceCount === 0) {
      logger.info('Seeding Dracovion Technologies Service Catalog...');
      const services = [
        {
          slug: 'website-development',
          title: 'Custom Website Development',
          shortDescription: 'High-performance, responsive corporate and business websites tailored to your brand.',
          fullDescription: 'We build blazingly fast, SEO-engineered websites with modern frameworks, custom typography, dark/light modes, and seamless conversion funnels.',
          category: 'website_development',
          indicativeStartingPriceMinor: 1500000, // ₹15,000.00
          typicalDeliveryDays: 7,
          features: [
            '100% Mobile & Tablet Responsive',
            'Modern Glassmorphic & Clean Aesthetics',
            'Core Web Vitals & SEO Optimized',
            'Contact Forms with Email Integration',
            'SSL & Security Hardening',
          ],
          deliverablesSummary: ['Source Code repository', 'Deployment configuration', 'Admin documentation'],
          isPopular: true,
          isActive: true,
          forStudents: false,
        },
        {
          slug: 'portfolio-and-landing',
          title: 'Portfolio & High-Conversion Landing Pages',
          shortDescription: 'Sleek personal portfolios and marketing landing pages engineered for lead generation.',
          fullDescription: 'Showcase your skills, services, or product with an unforgettable aesthetic. Fast loading, smooth micro-interactions, and clear conversion paths.',
          category: 'portfolio_and_landing',
          indicativeStartingPriceMinor: 800000, // ₹8,000.00
          typicalDeliveryDays: 5,
          features: [
            'Hero Animations & Smooth Scrolling',
            'Interactive Project Showcases',
            'Call-to-Action & Lead Capture',
            'Custom Domain & Hosting Setup',
          ],
          deliverablesSummary: ['Production build', 'Hosting guide', 'Source code'],
          isPopular: false,
          isActive: true,
          forStudents: false,
        },
        {
          slug: 'ecommerce-websites',
          title: 'Modern E-Commerce Solutions',
          shortDescription: 'Secure online stores with catalog management, payment processing, and inventory tracking.',
          fullDescription: 'Custom online retail platforms featuring intuitive product filters, shopping carts, order workflows, and Indian payment gateway readiness.',
          category: 'ecommerce',
          indicativeStartingPriceMinor: 3500000, // ₹35,000.00
          typicalDeliveryDays: 20,
          features: [
            'Product Catalog & Inventory Engine',
            'Cart, Checkout & Order Tracking',
            'UPI & Payment Gateway Integration',
            'Admin Sales & Order Dashboard',
            'Automated Invoicing & Email Receipts',
          ],
          deliverablesSummary: ['Full-stack platform', 'Payment gateway keys setup', 'Admin manual'],
          isPopular: true,
          isActive: true,
          forStudents: false,
        },
        {
          slug: 'fullstack-web-applications',
          title: 'Full-Stack Web Applications',
          shortDescription: 'Scalable SaaS platforms, customer portals, and internal business management software.',
          fullDescription: 'Custom enterprise and startup web applications built with TypeScript, React, Node.js, and MongoDB. Secure RBAC, real-time updates, and responsive dashboards.',
          category: 'fullstack_web_app',
          indicativeStartingPriceMinor: 5000000, // ₹50,000.00
          typicalDeliveryDays: 30,
          features: [
            'Role-Based Access Control (RBAC)',
            'REST / GraphQL API Architectures',
            'Real-Time Notifications & Dashboards',
            'Audit Logging & Data Security',
            'Multi-tenant Architecture Ready',
          ],
          deliverablesSummary: ['Frontend & Backend source', 'Database schemas & migrations', 'API docs', 'CI/CD pipeline'],
          isPopular: true,
          isActive: true,
          forStudents: false,
        },
        {
          slug: 'backend-and-database',
          title: 'Backend APIs & Database Applications',
          shortDescription: 'Robust RESTful API design, database architecture, and micro-integrations.',
          fullDescription: 'High-throughput backend architectures with Express/Node.js, MongoDB Atlas indexing, automated backups, and low-latency API design.',
          category: 'backend_and_database',
          indicativeStartingPriceMinor: 2500000, // ₹25,000.00
          typicalDeliveryDays: 14,
          features: [
            'Versioned REST API Endpoints',
            'Data Indexing & Query Optimization',
            'Rate Limiting & Authentication',
            'OpenAPI / Swagger Documentation',
          ],
          deliverablesSummary: ['API Server Code', 'Postman / OpenAPI Collection', 'Database Schema DDL'],
          isPopular: false,
          isActive: true,
          forStudents: false,
        },
        {
          slug: 'ai-and-ml-solutions',
          title: 'AI & Machine Learning Solutions',
          shortDescription: 'Intelligent automation, natural language processing, and smart assistants for business.',
          fullDescription: 'Practical AI implementations including intelligent document processing, predictive analytics, custom LLM integrations, and automated customer triage.',
          category: 'ai_and_ml_solutions',
          indicativeStartingPriceMinor: 4500000, // ₹45,000.00
          typicalDeliveryDays: 25,
          features: [
            'Custom AI Workflow Pipelines',
            'Automated Data Extraction & OCR',
            'Intelligent Chat & Retrieval Systems',
            'Predictive Business Insights',
          ],
          deliverablesSummary: ['Model & Service Integration', 'API Connectors', 'Evaluation Benchmarks'],
          isPopular: false,
          isActive: true,
          forStudents: false,
        },
        {
          slug: 'workflow-automation',
          title: 'Workflow Automation & System Integration',
          shortDescription: 'Eliminate repetitive manual tasks with automated triggers, webhooks, and custom bots.',
          fullDescription: 'Connect your CRMs, spreadsheets, WhatsApp/SMS alerts, and email notifications into unified automated workflows that save hours daily.',
          category: 'workflow_automation',
          indicativeStartingPriceMinor: 1800000, // ₹18,000.00
          typicalDeliveryDays: 10,
          features: [
            'Cross-platform Webhook Automation',
            'WhatsApp & Email Notification Bots',
            'Automated Invoice & PDF Generation',
            'Data Synchronization Between Systems',
          ],
          deliverablesSummary: ['Automation Scripts', 'Webhook Endpoints', 'Monitoring Dashboard'],
          isPopular: false,
          isActive: true,
          forStudents: false,
        },
        {
          slug: 'ui-ux-design',
          title: 'UI/UX Design & Frontend Development',
          shortDescription: 'State-of-the-art visual design systems, wireframing, and pixel-perfect interactive UIs.',
          fullDescription: 'Deep user research, modern dark/futuristic interface designs, component library creation, and accessible responsive frontend development.',
          category: 'ui_ux_design',
          indicativeStartingPriceMinor: 2000000, // ₹20,000.00
          typicalDeliveryDays: 12,
          features: [
            'Figma Wireframes & Prototypes',
            'Custom Design System Tokens',
            'Accessibility (WCAG) Compliance',
            'High-Fidelity Interaction Design',
          ],
          deliverablesSummary: ['Design Files', 'Component Style Guide', 'Responsive React Components'],
          isPopular: false,
          isActive: true,
          forStudents: false,
        },
        {
          slug: 'technical-consulting',
          title: 'Technical Consulting & System Architecture',
          shortDescription: 'Strategic technology guidance, cloud migration planning, and code quality audits.',
          fullDescription: 'Founder-to-founder technical advising. Make smart technology choices, reduce cloud costs, architect secure databases, and avoid costly re-writes.',
          category: 'technical_consulting',
          indicativeStartingPriceMinor: 1000000, // ₹10,000.00
          typicalDeliveryDays: 5,
          features: [
            'Architecture Review & Tech Stack Advisory',
            'Code & Security Vulnerability Assessment',
            'Database Optimization Strategy',
            'Cloud Cost Reduction Roadmap',
          ],
          deliverablesSummary: ['Architecture Blueprint PDF', 'Security Audit Report', 'Roadmap Action Plan'],
          isPopular: false,
          isActive: true,
          forStudents: false,
        },
        {
          slug: 'website-maintenance',
          title: 'Website Maintenance & Security Support',
          shortDescription: 'Ongoing security patches, performance monitoring, regular backups, and content updates.',
          fullDescription: 'Keep your web assets updated, secure, and running smoothly. 24/7 uptime monitoring, regular off-site database backups, and rapid incident resolution.',
          category: 'maintenance_and_support',
          indicativeStartingPriceMinor: 600000, // ₹6,000.00 / mo
          typicalDeliveryDays: 30,
          features: [
            'Scheduled Security & Dependency Updates',
            'Automated Daily Offsite Backups',
            'Uptime & Performance Monitoring',
            'Dedicated Priority Bug Resolution',
          ],
          deliverablesSummary: ['Monthly Maintenance Report', 'Backup Verification Log'],
          isPopular: false,
          isActive: true,
          forStudents: false,
        },
        // Allhunter Student-Specific Services
        {
          slug: 'allhunter-student-project',
          title: 'Allhunter: Final Year & Mini Project Development',
          shortDescription: 'Legitimate prototype development, full source code, architecture guidance, and viva prep for engineering students.',
          fullDescription: 'Dedicated to college students in Tamil Nadu and India. We help you build genuine, working software prototypes with clean architecture, proper documentation, and deep mentoring so you understand every line of code for your viva.',
          category: 'allhunter_student_project',
          indicativeStartingPriceMinor: 450000, // ₹4,500.00 (Student friendly)
          typicalDeliveryDays: 7,
          features: [
            'Complete Working Prototype & Source Code',
            'System Architecture & Flowchart Diagrams',
            'Database Schema & API Walkthrough',
            'Viva Technical Preparation Sessions',
            'Legitimate Academic Alignment (No Dishonesty)',
          ],
          deliverablesSummary: ['Full Git Repository', 'Project Report Documentation', 'Viva Q&A Guide'],
          isPopular: true,
          isActive: true,
          forStudents: true,
        },
        {
          slug: 'allhunter-mentoring',
          title: 'Allhunter: 1-on-1 Code Mentoring & Guidance',
          shortDescription: 'Personalized hands-on technical mentoring in Full-Stack, React, Node.js, and Python.',
          fullDescription: 'Get unstuck on complex programming concepts, debug difficult bugs with a senior engineer, and learn industry-standard software engineering practices.',
          category: 'allhunter_mentoring',
          indicativeStartingPriceMinor: 150000, // ₹1,500.00
          typicalDeliveryDays: 3,
          features: [
            '1-on-1 Screen Share Code Reviews',
            'Debugging Complex Runtime Errors',
            'Git & Modern Tooling Workflows',
            'Career & Industry Guidance',
          ],
          deliverablesSummary: ['Annotated Code Diffs', 'Resource Checklist', 'Session Recording'],
          isPopular: false,
          isActive: true,
          forStudents: true,
        },
      ];

      await ServiceCatalog.insertMany(services);
      logger.info('Service catalog seeded with 12 comprehensive services.');
    }

    // 3. Seed / Synchronize Official Production Portfolio Items
    const realProjects = [
      {
        slug: 'intelligrade-ai',
        title: 'IntelliGrade — AI Answer Script Evaluation & Document Intelligence',
        clientType: 'Academic Institutions & Universities',
        industry: 'EdTech & Artificial Intelligence',
        summary: 'Production-grade AI examination answer script evaluation platform & multi-engine OCR document intelligence system with human-in-the-loop review.',
        problemStatement: 'Educational institutions struggle with slow manual examination grading, subjective scoring inconsistencies, and the high friction of digitizing handwritten mathematical equations and regional language answer scripts.',
        solutionOverview: 'Architected a multi-engine OCR consensus ensemble (Tesseract, EasyOCR, Surya, PaddleOCR, docTR) paired with LaTeX-OCR and a 7-signal explainable AI evaluation engine (semantic, keyword, concept, reasoning, completeness) with a strict human-in-the-loop teacher review workflow.',
        techStack: ['Python', 'FastAPI', 'React 19', 'PostgreSQL', 'PyTorch', 'Celery', 'Redis', 'Docker'],
        outcomeMetrics: [
          '1,520+ automated tests passed across backend and evaluation pipelines',
          '90%+ auto-suggested grading confidence tier on standard rubrics',
          'Multi-engine OCR fusion ensuring high-accuracy handwritten text extraction',
        ],
        isSampleProject: false,
        category: 'ai_ml_solution',
        liveUrl: 'https://github.com/gausikofficial011/IntelliGrade',
        isFeatured: true,
      },
      {
        slug: 'buildsphere-ai',
        title: 'BuildSphere AI — Enterprise Construction Management & BIM Platform',
        clientType: 'Commercial Civil & Infrastructure Developers',
        industry: 'Construction & Digital Twin Technology',
        summary: 'Comprehensive enterprise civil operations platform integrating 3D BIM spatial models, interactive floorplans, task kanban, site issue tracking, and automated Google Docs engineering logs.',
        problemStatement: 'Civil and construction enterprises grapple with fragmented communication between site engineers, contractors, and architects, lost daily site logs, delayed RFI resolution, and lack of live 3D BIM spatial tracking.',
        solutionOverview: 'Engineered a full-stack platform featuring interactive 3D BIM spatial models, floorplan viewers, real-world task kanbans, unified issue trackers (RFI, NCR, Risk, Change Order), and automated daily Google Docs engineering report generators across 25 isolated portal roles.',
        techStack: ['FastAPI', 'Python', 'React 19', 'TypeScript', '3D BIM / Spatial', 'SQLite / Postgres', 'Docker'],
        outcomeMetrics: [
          '25 isolated portal roles orchestrating engineers, contractors, and owners',
          'Sub-second 3D BIM spatial digital twin inspection on web viewports',
          'Automated daily site log generation eliminating manual PDF drafting',
        ],
        isSampleProject: false,
        category: 'fullstack_web_app',
        liveUrl: 'https://github.com/gausikofficial011/BuildSphere-AI',
        isFeatured: true,
      },
      {
        slug: 'sentinelx-ai',
        title: 'SentinelX AI — Autonomous Security & Threat Intelligence Mesh',
        clientType: 'Enterprise Security & Facility Operations',
        industry: 'Cybersecurity & Edge Computing',
        summary: 'Autonomous neural edge surveillance and threat intelligence system featuring live video stream telemetry, real-time perimeter anomaly detection, and automated officer dispatch.',
        problemStatement: 'Traditional security systems rely on passive video recording with high human operator fatigue, leading to missed perimeter breaches and delayed tactical response during critical security incidents.',
        solutionOverview: 'Deployed an autonomous neural edge computing pipeline with real-time video telemetry stream ingestion, temporal anomaly classification, and automated instant push alerts to mobile perimeter officers.',
        techStack: ['TypeScript', 'Python', 'FastAPI', 'PyTorch', 'React Native', 'WebRTC', 'Docker'],
        outcomeMetrics: [
          'Real-time neural edge inference on multi-camera RTSP/WebRTC streams',
          'Sub-120ms video telemetry alert dispatch to mobile response units',
          'Dark-mode tactical HUD with zero-latency video rendering',
        ],
        isSampleProject: false,
        category: 'ai_ml_solution',
        liveUrl: 'https://github.com/gausikofficial011/SentinelX-AI',
        isFeatured: true,
      },
      {
        slug: 'real-time-emergency-system',
        title: 'Real-Time Emergency Response & Dispatch System 3.0',
        clientType: 'Municipal Public Safety & First Responders',
        industry: 'Emergency Services & Public Infrastructure',
        summary: 'Mission-critical emergency coordination and dispatch application enabling instant citizen SOS beacon broadcasting, automated GPS triangulation, and live first-responder navigation.',
        problemStatement: 'Emergency dispatch systems experience lethal delays due to inaccurate citizen coordinate broadcasting, congested dispatcher queues, and uncoordinated triage allocation between medical, police, and fire units.',
        solutionOverview: 'Engineered a sub-second WebSocket telemetry mesh with one-tap SOS beacon broadcasting, automated GPS triangulation, nearest-responder dynamic routing, and offline-tolerant SQLite sync.',
        techStack: ['TypeScript', 'React Native', 'Node.js', 'Express', 'Socket.io', 'Mapbox / GPS', 'MongoDB'],
        outcomeMetrics: [
          'Sub-3 second beacon dispatch to nearest responding emergency unit',
          'Multi-agency synchronized incident triage dashboard',
          '99.99% mission-critical uptime guarantee',
        ],
        isSampleProject: false,
        category: 'mobile_app',
        liveUrl: 'https://github.com/gausikofficial011/Real-Time-Emergency-System-3.0-APP',
        isFeatured: true,
      },
      {
        slug: 'rag-voice-ai-platform',
        title: 'RAG Voice AI — Multimodal Interactive Knowledge Assistant',
        clientType: 'Enterprise Knowledge Centers & Customer Support',
        industry: 'Conversational AI & Voice Computing',
        summary: 'Voice-first Retrieval-Augmented Generation agent architecture combining real-time streaming speech recognition, high-density vector search, and grounded LLM audio synthesis.',
        problemStatement: 'Voice interaction systems suffer from noticeable latency (>1.5s), hallucinated responses without verifiable grounding, and poor contextual turn-taking during complex technical inquiries.',
        solutionOverview: 'Constructed a full-duplex streaming audio pipeline utilizing Whisper, ChromaDB dense vector indexing, and LangChain orchestration to synthesize verified, cited domain answers under 450ms.',
        techStack: ['Python', 'FastAPI', 'LangChain', 'ChromaDB', 'Whisper', 'WebSockets', 'React'],
        outcomeMetrics: [
          'Sub-450ms end-to-end voice query response pipeline',
          '100% grounded domain citations with verifiable vector source links',
          'Full-duplex WebSocket audio streaming with turn-taking detection',
        ],
        isSampleProject: false,
        category: 'ai_ml_solution',
        liveUrl: 'https://github.com/gausikofficial011/RAG-VOICE-AI-PLATFORM',
        isFeatured: true,
      },
      {
        slug: 'securevendor-commerce',
        title: 'SecureVendor — Multi-Tenant WhatsApp B2B Commerce Platform',
        clientType: 'Wholesale Merchants & Commercial Distributors',
        industry: 'E-Commerce & Conversational Retail',
        summary: 'Secure multi-tenant commerce engine connecting industrial and consumer merchants to verified WhatsApp ordering channels, automated GST billing, and credit ledgers.',
        problemStatement: 'Merchants lose significant sales due to complex retail checkouts, lack of native WhatsApp catalog ordering, and manual GST invoice calculations that delay B2B fulfillment.',
        solutionOverview: 'Engineered a multi-tenant WhatsApp Cloud API commerce gateway with interactive catalog carts, automated GST calculation engine, and customer credit ledger tracking.',
        techStack: ['TypeScript', 'React 19', 'Node.js', 'WhatsApp Cloud API', 'PostgreSQL', 'Tailwind CSS'],
        outcomeMetrics: [
          '100% catalog-to-WhatsApp direct conversion funnel',
          'Automated GST compliant tax calculation & PDF invoicing',
          'Multi-branch vendor isolation with dedicated custom domain routing',
        ],
        isSampleProject: false,
        category: 'ecommerce',
        liveUrl: 'https://github.com/gausikofficial011/securevendor',
        isFeatured: true,
      },
    ];

    for (const proj of realProjects) {
      await PortfolioItem.findOneAndUpdate(
        { slug: proj.slug },
        { $set: proj },
        { upsert: true, new: true }
      );
    }
    logger.info('Official production portfolio projects synchronized successfully.');
  } catch (err) {
    logger.error('Error during database initial seed', err);
  }
}
