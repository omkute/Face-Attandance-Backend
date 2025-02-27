import express from 'express';
import { stopAttendanceMonitoring, getAttendanceByDate } from '../controllers/attendanceface.js';
import { FaceAttendance } from "../models/faceAttendance.js";

const router = express.Router();

router.route("/stop").get(stopAttendanceMonitoring);
router.route("/get/:date").get(getAttendanceByDate);
router.get("/avgattendence", async (req, res) => {
    try {
        const result = await FaceAttendance.aggregate([
            {
                $group: {
                    _id: null,
                    totalRecords: { $sum: 1 },
                    presentCount: {
                        $sum: {
                            $cond: [
                                { $regexMatch: { 
                                    input: { $toLower: "$remark" }, 
                                    regex: /^present$/
                                }},
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalRecords: 1,
                    presentCount: 1,
                    avgAttendance: {
                        $multiply: [
                            { $divide: ["$presentCount", "$totalRecords"] },
                            100
                        ]
                    }
                }
            }
        ]);

        console.log('Attendance calculation result:', result);

        res.json({
            success: true,
            data: {
                avgAttendance: result[0]?.avgAttendance || 0,
                totalRecords: result[0]?.totalRecords || 0,
                presentCount: result[0]?.presentCount || 0
            }
        });
    } catch (error) {
        console.error("Error calculating average attendance:", error);
        res.status(500).json({ 
            success: false,
            message: "Error calculating average attendance",
            error: error.message
        });
    }
});

export default router;

