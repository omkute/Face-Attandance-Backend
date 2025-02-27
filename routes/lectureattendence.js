import { createLectureAttendence, getLectureAttendence } from "../controllers/lectureattendence.js";
import express from 'express';

const router = express.Router();

router.post("/create", createLectureAttendence);
router.get("/get", getLectureAttendence);

export default router;