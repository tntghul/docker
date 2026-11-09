import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    targetRole: { type: String, required: true },
    targetCompany: { type: String, default: "General" },
    jobDescriptionRaw: { type: String, required: true },
    matchScore: { type: Number, default: 0 },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    tailoredSummary: { type: String, required: true },
    selectedProjects: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        techStack: [{ type: String }],
        liveUrl: { type: String, default: "" },
        githubUrl: { type: String, default: "" }
      }
    ],
    selectedExperience: [
      {
        company: { type: String, required: true },
        role: { type: String, required: true },
        startDate: { type: String, required: true },
        endDate: { type: String, default: "Present" },
        highlights: [{ type: String }]
      }
    ]
  },
  { timestamps: true }
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
