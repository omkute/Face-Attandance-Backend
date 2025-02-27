import express from 'express';
import { getAttendanceByDate } from '../controllers/attendanceface.js';

const router = express.Router();

// Route to get attendance by date
router.get('/attendance/:date', getAttendanceByDate);

export default router;
