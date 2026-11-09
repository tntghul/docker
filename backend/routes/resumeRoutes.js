import express from "express";
import {
  generateResume,
  saveResume,
  getResumeHistory,
  getResumeById,
  deleteResume
} from "../controller/resumeController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected AI Resume routes
router.post("/generate", verifyAdmin, generateResume);
router.post("/save", verifyAdmin, saveResume);
router.get("/history", verifyAdmin, getResumeHistory);
router.get("/:id", verifyAdmin, getResumeById);
router.delete("/:id", verifyAdmin, deleteResume);

export default router;
