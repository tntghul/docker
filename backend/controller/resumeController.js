import Resume from "../model/Resume.js";
import Portfolio from "../model/Portfolio.js";
import { generateTailoredResume } from "../services/geminiService.js";

// Generate tailored resume using Gemini API & portfolio data
export const generateResume = async (req, res) => {
  try {
    const { jobDescription, targetRole, targetCompany } = req.body;
    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ message: "Job description is required for AI resume analysis." });
    }

    // Fetch applicant's ground truth portfolio data
    let portfolio = await Portfolio.findOne({ userId: req.user?.userId });
    if (!portfolio) {
      portfolio = await Portfolio.findOne();
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

// Save tailored resume into database history
export const saveResume = async (req, res) => {
  try {
    const resumeData = {
      ...req.body,
      userId: req.user?.userId || null
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

// Get list of previous resumes
export const getResumeHistory = async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch resume history", error: error.message });
  }
};

// Get single resume details
export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: "Error fetching resume", error: error.message });
  }
};

// Delete a resume from history
export const deleteResume = async (req, res) => {
  try {
    const deleted = await Resume.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.json({ message: "Resume deleted successfully from history." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete resume", error: error.message });
  }
};
