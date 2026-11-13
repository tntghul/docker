import express from "express";
import {
  getPublicPortfolio,
  getAdminPortfolio,
  updatePortfolio
} from "../controller/portfolioController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route for public portfolio view (supports optional /public/:userId)
router.get("/public", getPublicPortfolio);
router.get("/public/:userId", getPublicPortfolio);

// Admin routes (Protected by JWT)
router.get("/admin", verifyAdmin, getAdminPortfolio);
router.put("/update", verifyAdmin, updatePortfolio);

export default router;
