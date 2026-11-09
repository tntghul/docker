import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  techStack: [{ type: String }],
  liveUrl: { type: String, default: "" },
  githubUrl: { type: String, default: "" },
  featured: { type: Boolean, default: false },
  category: { type: String, default: "Full Stack" }
});

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, default: "Present" },
  location: { type: String, default: "Remote" },
  highlights: [{ type: String }]
});

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String, default: "" },
  startYear: { type: String, default: "" },
  endYear: { type: String, default: "" }
});

const certificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  issuer: { type: String, required: true },
  issueDate: { type: String, default: "" },
  credentialUrl: { type: String, default: "" }
});

const portfolioSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    personalInfo: {
      fullName: { type: String, default: "Ayansh Developer" },
      title: { type: String, default: "Full Stack Developer & AI Enthusiast" },
      email: { type: String, default: "ayansh@example.com" },
      phone: { type: String, default: "+91 9876543210" },
      location: { type: String, default: "India" },
      bio: {
        type: String,
        default: "Passionate Full Stack MERN Developer crafting high-performance, scalable web applications and intelligent AI-integrated systems."
      },
      avatarUrl: { type: String, default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" },
      resumeUrl: { type: String, default: "" }
    },
    aboutMe: {
      story: {
        type: String,
        default: "I build end-to-end web architectures from resilient Node/Express backends to responsive React frontends. Always exploring AI tooling and modern system designs."
      },
      highlights: {
        type: [String],
        default: [
          "3+ years experience with React, Node.js & MongoDB",
          "Engineered AI-integrated workflows and automated resume tailoring",
          "Passionate about clean architecture, microservices, and high-speed UX"
        ]
      }
    },
    skills: {
      type: [
        {
          category: { type: String, required: true },
          items: [{ type: String }]
        }
      ],
      default: [
        { category: "Frontend", items: ["React.js", "JavaScript (ES6+)", "Bootstrap 5", "HTML5/CSS3", "Vite"] },
        { category: "Backend", items: ["Node.js", "Express.js", "REST APIs", "JWT Auth", "System Design"] },
        { category: "Databases", items: ["MongoDB", "Mongoose", "PostgreSQL", "Redis"] },
        { category: "AI & Tools", items: ["Google Gemini API", "Git & GitHub", "Docker", "Postman", "Vercel"] }
      ]
    },
    projects: {
      type: [projectSchema],
      default: [
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
      ]
    },
    experience: {
      type: [experienceSchema],
      default: [
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
      ]
    },
    education: {
      type: [educationSchema],
      default: [
        {
          institution: "National Institute of Technology",
          degree: "Bachelor of Technology",
          fieldOfStudy: "Computer Science & Engineering",
          startYear: "2018",
          endYear: "2022"
        }
      ]
    },
    certifications: {
      type: [certificationSchema],
      default: [
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
      ]
    },
    socialLinks: {
      github: { type: String, default: "https://github.com" },
      linkedin: { type: String, default: "https://linkedin.com" },
      twitter: { type: String, default: "https://twitter.com" },
      website: { type: String, default: "https://myportfolio.com" }
    },
    theme: { type: String, default: "modern-dark" },
    isPublished: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

export default Portfolio;
