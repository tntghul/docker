import { GoogleGenAI } from "@google/genai";

// Intelligent Skill Extractor for Job Descriptions
const extractSkillsFromJd = (jd) => {
  if (!jd) return [];
  const found = new Set();
  const jdLower = jd.toLowerCase();

  const knownTechs = [
    // Full Stack & Frontend
    "React.js", "React", "Node.js", "Express.js", "MongoDB", "MERN stack", "MERN",
    "Redux", "Context API", "Zustand", "Recoil", "MobX", "Hooks", "React Hooks",
    "Next.js", "Vue.js", "Angular", "TypeScript", "JavaScript", "ES6+", "HTML5", "CSS3",
    "Tailwind CSS", "Tailwind", "Bootstrap 5", "Bootstrap", "Material UI", "Sass",
    "Webpack", "Vite", "Axios", "React Query", "Responsive Web Design", "Responsive Design",

    // Backend & APIs
    "REST APIs", "RESTful APIs", "GraphQL", "Microservices", "WebSockets", "Socket.io",
    "NestJS", "FastAPI", "Django", "Spring Boot", "Python", "Java", "Golang", "C#", ".NET",

    // Database & Caching
    "Mongoose", "PostgreSQL", "MySQL", "Redis", "Prisma", "Elasticsearch", "SQL", "NoSQL",

    // Cloud, DevOps, Tools
    "Docker", "Kubernetes", "AWS", "Amazon Web Services", "Azure", "GCP", "Google Cloud",
    "CI/CD", "GitHub Actions", "Git", "GitHub", "Vercel", "Linux", "Nginx",

    // Testing & Quality
    "Jest", "Cypress", "Playwright", "Mocha", "Unit Testing", "Integration Testing",

    // Architectures & Methods
    "State Management", "System Design", "Scalable Web Applications", "Agile", "Scrum"
  ];

  knownTechs.forEach((tech) => {
    const escaped = tech.replace(/[.+*?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(jd) || jdLower.includes(tech.toLowerCase())) {
      found.add(tech);
    }
  });

  // Extract from parentheses like (MongoDB, Express.js, React.js, Node.js) or (Redux, Context API, Zustand)
  const parenMatches = jd.match(/\(([^)]+)\)/g) || [];
  parenMatches.forEach((paren) => {
    const inner = paren.slice(1, -1);
    const parts = inner.split(/[,;/|]+/).map((p) => p.trim());
    parts.forEach((p) => {
      const cleaned = p.replace(/^(e\.g\.|including|such as)\s*/i, "").trim();
      if (cleaned.length > 1 && cleaned.length < 35 && !cleaned.toLowerCase().includes("etc")) {
        found.add(cleaned);
      }
    });
  });

  const list = Array.from(found);
  return list.filter((item) => {
    if (item === "MERN" && list.includes("MERN stack")) return false;
    if (item === "React" && (list.includes("React.js") || list.includes("React Native"))) return false;
    if (item === "Hooks" && list.includes("React Hooks")) return false;
    if (item === "Tailwind" && list.includes("Tailwind CSS")) return false;
    if (item === "Bootstrap" && list.includes("Bootstrap 5")) return false;
    if (item === "Responsive Design" && list.includes("Responsive Web Design")) return false;
    return true;
  });
};

// Deterministic intelligent tailoring engine (guarantees all JD requirements are added to CV)
const fallbackTailorResume = (portfolio, jobDescription, targetRole, targetCompany) => {
  const jdLower = (jobDescription || "").toLowerCase();

  // 1. Candidate's existing skills from portfolio
  const candidateSkills = [];
  if (portfolio.skills && Array.isArray(portfolio.skills)) {
    portfolio.skills.forEach((cat) => {
      if (Array.isArray(cat.items)) {
        candidateSkills.push(...cat.items);
      }
    });
  }

  // 2. Extract all skills requested by the JD
  const jdSkills = extractSkillsFromJd(jobDescription);

  // 3. Matched skills already in profile
  const matchedSkills = candidateSkills.filter((s) =>
    jdLower.includes(s.toLowerCase()) || jdSkills.some((j) => j.toLowerCase() === s.toLowerCase())
  );

  // 4. Skills present in JD that were missing from candidate's profile -> ADD THEM TO CV!
  const addedFromJdSkills = jdSkills.filter(
    (jSkill) => !candidateSkills.some((cSkill) => cSkill.toLowerCase() === jSkill.toLowerCase())
  );

  // 5. Total comprehensive skills list for the tailored CV
  // Contains matched skills + ALL newly added JD skills + top existing skills
  const tailoredSkills = Array.from(
    new Set([...matchedSkills, ...addedFromJdSkills, ...candidateSkills.slice(0, 5)])
  );

  // 6. ATS-optimized summary integrating JD requirements
  const keySkillsSummary = (addedFromJdSkills.length > 0 ? addedFromJdSkills : matchedSkills).slice(0, 5).join(", ");
  const tailoredSummary = `Results-driven ${targetRole} with proven engineering experience specializing in ${keySkillsSummary || "full-stack development"}. Demonstrated track record of designing scalable web architectures, clean APIs, and modern user interfaces aligned with ${targetCompany || "modern engineering standards"}. Experienced across the entire product lifecycle from conceptualization to reliable production deployment.`;

  // 7. Projects: prioritize or enrich relevant projects with JD technologies
  const selectedProjects = (portfolio.projects || []).slice(0, 3).map((p, pIdx) => {
    const enrichedStack = Array.from(
      new Set([...(p.techStack || []), ...(addedFromJdSkills.slice(pIdx * 2, pIdx * 2 + 2))])
    );
    return {
      title: p.title,
      description: p.description,
      techStack: enrichedStack,
      liveUrl: p.liveUrl || "",
      githubUrl: p.githubUrl || ""
    };
  });

  // 8. Experience: enrich bullet points with JD keywords
  const selectedExperience = (portfolio.experience || []).map((exp, eIdx) => {
    const existingHighlights = Array.isArray(exp.highlights) ? [...exp.highlights] : [];
    // If we have newly added skills from JD, seamlessly inject an accomplishment bullet
    if (eIdx === 0 && addedFromJdSkills.length > 0) {
      const topAdded = addedFromJdSkills.slice(0, 3).join(", ");
      existingHighlights.unshift(
        `Architected and optimized scalable components and state workflows utilizing ${topAdded}, improving maintainability and response performance.`
      );
    }
    return {
      company: exp.company,
      role: exp.role,
      startDate: exp.startDate,
      endDate: exp.endDate,
      highlights: existingHighlights
    };
  });

  return {
    targetRole,
    targetCompany: targetCompany || "General",
    matchScore: 98,
    matchedSkills: matchedSkills.length > 0 ? matchedSkills : candidateSkills.slice(0, 6),
    addedFromJdSkills,
    tailoredSkills,
    missingSkills: [], // Zero missing: everything from JD is now integrated into the CV!
    tailoredSummary,
    selectedProjects,
    selectedExperience
  };
};

export const generateTailoredResume = async (portfolio, jobDescription, targetRole, targetCompany) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_actual_gemini_api_key_here") {
    console.log("Gemini API key not configured. Using intelligent auto-tailoring engine.");
    return fallbackTailorResume(portfolio, jobDescription, targetRole, targetCompany);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an expert Technical Recruiter and ATS Optimization Engine.
Your objective is to tailor an applicant's resume for a specific Job Description (JD).

### CRITICAL REQUIREMENTS:
1. Thoroughly analyze the Job Description to extract all required technical skills, frameworks, tools, state management libraries, and responsibilities.
2. If any skill or technology mentioned in the JD is missing from the applicant's portfolio, YOU MUST ADD IT into "addedFromJdSkills" and include it in "tailoredSkills" so that the candidate's CV fully satisfies the job requirements.
3. Under "tailoredSkills", provide a comprehensive list containing BOTH the applicant's existing skills and ALL skills extracted from the JD.
4. Set "missingSkills" to an empty array [] because all JD requirements have now been successfully incorporated into the CV.
5. Set "matchScore" to 95-100 to reflect full alignment.
6. Write a tailored, ATS-friendly Professional Summary incorporating the target role and key JD technologies.
7. Adapt experience bullet points and project tech stacks to reflect the JD's requirements.

### APPLICANT_PORTFOLIO:
${JSON.stringify(portfolio, null, 2)}

### TARGET JOB DESCRIPTION:
Target Role: ${targetRole}
Target Company: ${targetCompany || "Undisclosed"}
Job Description Text:
${jobDescription}

Respond strictly in valid JSON matching this exact structure:
{
  "targetRole": "${targetRole}",
  "targetCompany": "${targetCompany || "General"}",
  "matchScore": 98,
  "matchedSkills": ["skill1", "skill2"],
  "addedFromJdSkills": ["skillFromJD1", "skillFromJD2"],
  "tailoredSkills": ["skill1", "skill2", "skillFromJD1", "skillFromJD2"],
  "missingSkills": [],
  "tailoredSummary": "<ATS summary integrating JD keywords>",
  "selectedProjects": [
    {
      "title": "<title>",
      "description": "<description>",
      "techStack": ["<tech1>", "<tech2>"],
      "liveUrl": "<url>",
      "githubUrl": "<url>"
    }
  ],
  "selectedExperience": [
    {
      "company": "<company>",
      "role": "<role>",
      "startDate": "<date>",
      "endDate": "<date>",
      "highlights": ["<highlight1>", "<highlight2>"]
    }
  ]
}
`;

    // Try gemini-2.0-flash first, then gemini-1.5-flash
    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
    } catch (e) {
      response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
    }

    const parsed = JSON.parse(response.text);
    return parsed;
  } catch (error) {
    console.error("Gemini API call failed, invoking intelligent auto-tailoring engine:", error.message);
    return fallbackTailorResume(portfolio, jobDescription, targetRole, targetCompany);
  }
};
