import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/database.js';
import userRouter from './routes/user.js';
import detailsRouter from './routes/details.js';
import FaceAttendance from './routes/FaceAttendenceRouter.js';
import LectureAttendence from './routes/lectureattendence.js';
import cors from "cors";
import { initializeAttendanceMonitoring, stopAttendanceMonitoring } from './controllers/attendanceface.js';
import cookieParser from 'cookie-parser';
import studentRouter from './routes/students.js';
import teacherRouter from './routes/teacher.js';
import subjectRouter from './routes/subject.js';
import attendanceRoutes from './routes/attendance.js';

const app = express(); //express app
dotenv.config(); // .env 


// First connect to database
await connectDB(); // Make sure this is awaited

// Then initialize the monitoring
console.log('\n📊 Initializing attendance monitoring system...');
initializeAttendanceMonitoring();
stopAttendanceMonitoring();

app.use(express.json()); // to parse json data from req

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
})) // to connect backend to frontend

//cookie parser
app.use(cookieParser());

// // Routes 
app.use("/api/v1/user", userRouter); //handle users
app.use("/api/v1/details", detailsRouter); //handle details
app.use("/api/v1/students", studentRouter); //handle students
app.use("/api/v1/teachers", teacherRouter); //handle teachers
app.use("/api/v1/subjects", subjectRouter); //handle subjects
app.use("/api/v1/attendance", FaceAttendance); //handle attendance
app.use("/api/v1/lectureattendance", LectureAttendence); //handle attendance
app.use('/api', attendanceRoutes); // Use attendance routes

const PORT = process.env.PORT || 3002; //port

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    
}) //start app on the given port

export default app;
