import Portfolio from "../model/Portfolio.js";
import { ensureConnected } from "../config/db.js";
import mongoose from "mongoose";

// Helper: Generates baseline portfolio template data
const getDefaultPortfolioData = (userId = null, isPrimary = false) => ({
  userId: userId || null,
  isPrimary: Boolean(isPrimary),
  personalInfo: {
    fullName: "Portfolio Developer",
    title: "Full Stack Developer & AI Engineer",
    email: "developer@example.com",
    phone: "+91 9876543210",
    location: "Bengaluru, India",
    bio: "Specializing in resilient MERN architectures, distributed backend APIs, and modern generative AI tools.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    resumeUrl: ""
  },
  aboutMe: {
    story: "I am a dedicated full-stack engineer who loves building clean software systems from concept to deployment. Experienced with high-throughput Express backends and reactive Vite/React interfaces.",
    highlights: [
      "3+ years experience with React, Node.js, Express, and MongoDB",
      "Engineered AI-tailored resume generation pipelines with zero hallucinations",
      "Passionate about clean architecture, microservices, and high-speed UX"
    ]
  },
  skills: [
    { category: "Frontend", items: ["React.js", "JavaScript (ES6+)", "Bootstrap 5", "HTML5/CSS3", "Vite", "React Router"] },
    { category: "Backend", items: ["Node.js", "Express.js", "RESTful APIs", "JWT Auth", "System Architecture"] },
    { category: "Databases", items: ["MongoDB", "Mongoose", "PostgreSQL", "Redis"] },
    { category: "AI & Tools", items: ["Google Gemini API", "Git & GitHub", "Docker", "Postman", "html2pdf.js"] }
  ],
  projects: [
    {
      title: "Smart Portfolio CMS + AI Resume Builder",
      description: "A headless portfolio management system with dynamic public rendering and zero-hallucination Gemini AI resume generation tailored to job descriptions.",
      techStack: ["React", "Node.js", "Express", "MongoDB", "Gemini API", "Bootstrap"],
      liveUrl: "https://example.com/demo",
      githubUrl: "https://github.com/example/portfolio-cms",
      featured: true,
      category: "Full Stack"
    },
    {
      title: "Enterprise E-Commerce Engine",
      description: "High-throughput microservices architecture with shopping cart, Stripe payment gateway, and real-time inventory management.",
      techStack: ["React", "Express", "MongoDB", "Redux", "Stripe API"],
      liveUrl: "https://example.com/ecommerce",
      githubUrl: "https://github.com/example/ecommerce",
      featured: true,
      category: "Full Stack"
    },
    {
      title: "AI Knowledge Base & Document Search",
      description: "Contextual semantic search engine indexing PDF documentation using vector embeddings and LLM summaries.",
      techStack: ["Node.js", "Gemini API", "Vector DB", "React"],
      liveUrl: "https://example.com/ai-search",
      githubUrl: "https://github.com/example/ai-search",
      featured: false,
      category: "AI/ML"
    }
  ],
  experience: [
    {
      company: "Tech Innovations Pvt Ltd",
      role: "Senior Full Stack Developer",
      startDate: "Jan 2024",
      endDate: "Present",
      location: "Bengaluru / Hybrid",
      highlights: [
        "Architected decoupled REST APIs serving 100K+ monthly requests with 99.9% uptime.",
        "Spearheaded migration to React 19 + Vite, boosting frontend performance by 45%.",
        "Mentored junior developers and instituted code review standards and CI/CD pipelines."
      ]
    },
    {
      company: "NextGen Software Labs",
      role: "Full Stack Developer",
      startDate: "Jul 2022",
      endDate: "Dec 2023",
      location: "Remote",
      highlights: [
        "Developed responsive user interfaces with Bootstrap 5 and React Router.",
        "Implemented JWT-based authentication and secure role-based access control.",
        "Optimized MongoDB queries and indexing, cutting response latencies in half."
      ]
    }
  ],
  education: [
    {
      institution: "National Institute of Technology",
      degree: "Bachelor of Technology",
      fieldOfStudy: "Computer Science & Engineering",
      startYear: "2018",
      endYear: "2022"
    }
  ],
  certifications: [
    {
      title: "Full Stack Web Development Professional",
      issuer: "Coursera / Meta",
      issueDate: "2023",
      credentialUrl: "https://coursera.org"
    },
    {
      title: "Generative AI Solutions Specialist",
      issuer: "Google Cloud",
      issueDate: "2024",
      credentialUrl: "https://cloud.google.com"
    }
  ],
  socialLinks: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    website: "https://myportfolio.com"
  },
  theme: "modern-dark",
  isPublished: true
});

// Public: Get published portfolio
// Returns primary portfolio by default, or specific portfolio if userId is provided
export const getPublicPortfolio = async (req, res) => {
  try {
    await ensureConnected();
    const requestedUserId = req.query.userId || req.params.userId;
    let portfolio = null;

    if (requestedUserId && mongoose.Types.ObjectId.isValid(requestedUserId)) {
      portfolio = await Portfolio.findOne({
        $or: [
          { userId: requestedUserId },
          { _id: requestedUserId }
        ]
      });
    }

    // If no specific portfolio found or requested, find primary (owner's) portfolio
    if (!portfolio) {
      portfolio = await Portfolio.findOne({ isPrimary: true });
    }

    // Fallback to earliest created portfolio if isPrimary hasn't been explicitly flagged yet
    if (!portfolio) {
      portfolio = await Portfolio.findOne().sort({ createdAt: 1 });
      if (portfolio && !portfolio.isPrimary) {
        portfolio.isPrimary = true;
        await portfolio.save();
      }
    }

    // Final fallback: initialize baseline primary portfolio if database is completely empty
    if (!portfolio) {
      portfolio = await Portfolio.create(getDefaultPortfolioData(null, true));
    }

    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: "Error fetching public portfolio", error: error.message });
  }
};

// Admin: Get portfolio for editing (strictly isolated to logged-in admin)
export const getAdminPortfolio = async (req, res) => {
  try {
    await ensureConnected();
    const userId = req.user.userId;

    // Look strictly for this user's portfolio
    let portfolio = await Portfolio.findOne({ userId });

    if (!portfolio) {
      // Check if there is an unassigned legacy portfolio (created before multi-user support)
      const unassigned = await Portfolio.findOne({
        $or: [{ userId: null }, { userId: { $exists: false } }]
      });

      if (unassigned) {
        // Claim the unassigned portfolio for this first user and mark as primary
        unassigned.userId = userId;
        unassigned.isPrimary = true;
        portfolio = await unassigned.save();
      } else {
        // Check if any primary portfolio exists
        const hasPrimary = await Portfolio.exists({ isPrimary: true });
        // Create an isolated personal portfolio for this user (never touching other admins)
        portfolio = await Portfolio.create(getDefaultPortfolioData(userId, !hasPrimary));
      }
    }

    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin portfolio", error: error.message });
  }
};

// Admin: Update portfolio sections (strictly updates ONLY the logged-in admin's portfolio)
export const updatePortfolio = async (req, res) => {
  try {
    await ensureConnected();
    const userId = req.user.userId;

    let portfolio = await Portfolio.findOne({ userId });

    if (!portfolio) {
      const hasPrimary = await Portfolio.exists({ isPrimary: true });
      portfolio = new Portfolio({
        ...getDefaultPortfolioData(userId, !hasPrimary),
        userId,
        isPrimary: !hasPrimary
      });
    }

    // Sanitize payload to prevent changing security-critical fields like userId or isPrimary
    const { userId: _u, isPrimary: _p, _id, createdAt, updatedAt, ...safeUpdateData } = req.body;
    Object.assign(portfolio, safeUpdateData);
    portfolio.userId = userId;

    const saved = await portfolio.save();
    res.json({ message: "Portfolio successfully updated!", data: saved });
  } catch (error) {
    res.status(500).json({ message: "Failed to update portfolio", error: error.message });
  }
};
