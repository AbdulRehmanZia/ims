import express from "express";
import { verifyJWT } from "../middleware/authMiddleware.js";
import { allAnalyst } from "../controller/Analyst/get/index.js";
import { recentActivity } from "../controller/recentActivity/get/index.js";
import { exportSalesReport } from "../controller/salesReport/index.js";

const router = express.Router();


router.get("/",verifyJWT, allAnalyst);
router.get("/recent-activity",verifyJWT, recentActivity);
// Sales report endpoints
router.get('/export', verifyJWT, exportSalesReport);


export default router