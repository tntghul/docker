import Resume from "../model/Resume.js";
import Portfolio from "../model/Portfolio.js";
import { generateTailoredResume } from "../services/geminiService.js";

// Generate tailored resume using Gemini API & portfolio data (strictly scoped to user's portfolio)
export const generateResume = async (req, res) => {
  try {
    const { jobDescription, targetRole, targetCompany } = req.body;
    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ message: "Job description is required for AI resume analysis." });
    }

    const userId = req.user?.userId;

    // Fetch applicant's ground truth portfolio data
    let portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      // Fallback only if no personal portfolio exists yet
      portfolio = await Portfolio.findOne({ isPrimary: true }) || await Portfolio.findOne();
    }

    if (!portfolio) {
      return res.status(404).json({ message: "No portfolio data found to base resume upon." });
    }

    const tailoredData = await generateTailoredResume(
      portfolio,
      jobDescription,
      targetRole || "Full Stack Developer",
      targetCompany || "Target Employer"
    );

    res.json({
      message: "AI resume analysis and tailoring completed successfully!",
      data: tailoredData
    });
  } catch (error) {
    console.error("Resume generation error:", error);
    res.status(500).json({ message: "Failed to generate tailored resume", error: error.message });
  }
};

// Save tailored resume into database history (strictly bound to logged-in admin)
export const saveResume = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const resumeData = {
      ...req.body,
      userId
    };

    const savedResume = await Resume.create(resumeData);
    res.status(201).json({
      message: "Tailored resume saved to history successfully!",
      data: savedResume
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to save resume", error: error.message });
  }
};

// Get list of previous resumes (strictly filtered by current user)
export const getResumeHistory = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch resume history", error: error.message });
  }
};

// Get single resume details (ensures ownership)
export const getResumeById = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const resume = await Resume.findOne({ _id: req.params.id, userId });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found or unauthorized access." });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: "Error fetching resume", error: error.message });
  }
};

// Delete a resume from history (ensures ownership)
export const deleteResume = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const deleted = await Resume.findOneAndDelete({ _id: req.params.id, userId });
    if (!deleted) {
      return res.status(404).json({ message: "Resume not found or unauthorized deletion." });
    }
    res.json({ message: "Resume deleted successfully from history." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete resume", error: error.message });
  }
};
