// backend/routes/dashboard.routes.js
import express from "express";
import { getDashboardSummary, getRecentDistributions, getSessionFamilies } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/dashboard/summary", getDashboardSummary);
router.get("/dashboard/recent-distributions", getRecentDistributions);
router.get("/dashboard/session/:sessionId/families", getSessionFamilies);

export default router;