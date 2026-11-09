import Portfolio from "../model/Portfolio.js";
import { ensureConnected } from "../config/db.js";

// Helper: Seed initial default portfolio if database is completely empty
const getOrCreateDefaultPortfolio = async (userId) => {
  await ensureConnected();
  let portfolio = await Portfolio.findOne();
  if (!portfolio) {
    portfolio = await Portfolio.create({
      userId: userId || null,
      personalInfo: {
        fullName: "Ayansh Developer",
        title: "Full Stack Developer & AI Engineer",
        email: "ayansh@example.com",
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
  }
  return portfolio;
};

// Public: Get published portfolio
export const getPublicPortfolio = async (req, res) => {
  try {
    const portfolio = await getOrCreateDefaultPortfolio();
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: "Error fetching public portfolio", error: error.message });
  }
};

// Admin: Get portfolio for editing
export const getAdminPortfolio = async (req, res) => {
  try {
    await ensureConnected();
    let portfolio = await Portfolio.findOne({ userId: req.user.userId });
    if (!portfolio) {
      portfolio = await Portfolio.findOne();
      if (portfolio && !portfolio.userId) {
        portfolio.userId = req.user.userId;
        await portfolio.save();
      }
    }
    if (!portfolio) {
      portfolio = await getOrCreateDefaultPortfolio(req.user.userId);
    }
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin portfolio", error: error.message });
  }
};

// Admin: Update portfolio sections
export const updatePortfolio = async (req, res) => {
  try {
    await ensureConnected();
    let portfolio = await Portfolio.findOne({ userId: req.user.userId });
    if (!portfolio) {
      portfolio = await Portfolio.findOne();
    }

    if (!portfolio) {
      portfolio = await getOrCreateDefaultPortfolio(req.user.userId);
    }

    // Merge update payload
    Object.assign(portfolio, req.body);
    if (!portfolio.userId) {
      portfolio.userId = req.user.userId;
    }

    const saved = await portfolio.save();
    res.json({ message: "Portfolio successfully updated!", data: saved });
  } catch (error) {
    res.status(500).json({ message: "Failed to update portfolio", error: error.message });
  }
};
