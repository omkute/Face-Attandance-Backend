import { FaceAttendance } from '../models/faceAttendance.js';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

// Remove the direct JSON import and add this:
let rollListData;
try {
    const rollListPath = path.join(process.cwd(), 'rollList.json');
    const jsonData = fs.readFileSync(rollListPath, 'utf8');
    rollListData = JSON.parse(jsonData);
} catch (error) {
    console.error('Error loading rollList.json:', error);
    rollListData = { students: [] }; // Fallback empty data
}

// Keep track of last processed records
let lastProcessedCount =  0;

// At the top of the file, add:
let monitoringInterval = 5  * 60 * 1000;

export const processFaceRecognitionCSV = async () => {
    try {
        console.log('\n📋 Checking CSV for updates...');
        const csvPath = path.join(process.cwd(), '../facerecmodel', 'attendance_sheet.csv');

        if(!csvPath) return "Path error"
        
        const processCSV = new Promise((resolve, reject) => {
            const results = [];
            let headersChecked = false;
            
            console.log('📖 Reading CSV file...');
            fs.createReadStream(csvPath)
                .pipe(csv({
                    mapValues: ({ header, value }) => value.trim()
                }))
                .on('headers', (headers) => {
                    console.log('🔍 CSV Headers:', headers);
                    const expectedHeaders = ['Roll No', 'Students Name', 'Semester', 'Status', 'Date'];
                    headersChecked = expectedHeaders.every((header, index) => header === headers[index]);
                    if (!headersChecked) {
                        console.error('❌ CSV headers do not match the expected format:', headers);
                        reject(new Error('CSV headers do not match the expected format'));
                    }
                })
                .on('data', (data) => {
                    if (!headersChecked) return;

                    // Parse the date string to a Date object
                    const timestamp = new Date(data.Date + 'T00:00:00Z');

                    // Only push if we have a valid date and roll number
                    if (!isNaN(timestamp.getTime()) && data['Roll No']) {
                        // Standardize the status to lowercase
                        const status = data.Status.toLowerCase();
                        results.push({
                            rollNo: parseInt(data['Roll No']),
                            studentName: data['Students Name'],
                            timestamp: timestamp,
                            remark: status,
                            semester: parseInt(data.Semester),
                        });
                    } else {
                        console.warn(`⚠️ Skipping invalid record: ${JSON.stringify(data)}`);
                    }
                })
                .on('end', () => {
                    if (!headersChecked) return;

                    if (results.length === 0) {
                        console.warn('⚠️ CSV file is empty or contains no valid records');
                    }

                    const newRecords = results.length - lastProcessedCount;
                    if (newRecords > 0) {
                        console.log(`📊 Found ${newRecords} new records in CSV`);
                    } else {
                        console.log('📊 No new records found in CSV');
                    }
                    resolve(results);
                })
                .on('error', (error) => {
                    console.error('❌ Error reading CSV:', error);
                    reject(error);
                });
        });

        const attendanceRecords = await processCSV;

        if (attendanceRecords.length === 0) {
            console.log('⚠️ No valid records found in CSV');
            return {
                success: false,
                message: 'No valid records found in CSV'
            };
        }

        // Process only if there are new records
        if (attendanceRecords.length > lastProcessedCount) {
            console.log('💾 Starting database updates...');
            let successCount = 0;
            let errorCount = 0;

            // Get unique dates from new records
            const uniqueDates = [...new Set(attendanceRecords
                .slice(lastProcessedCount)
                .map(record => record.timestamp.toISOString().split('T')[0]))];

            for (const date of uniqueDates) {
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);
                
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);

                // Get present students for this date
                const presentStudents = attendanceRecords
                    .filter(record => record.timestamp >= startOfDay && record.timestamp < endOfDay)
                    .map(record => record.rollNo);

                // Mark absent students
                const absentStudents = rollListData.students
                    .filter(student => !presentStudents.includes(student.rollNo))
                    .map(student => ({
                        rollNo: student.rollNo,
                        studentName: student.name,
                        timestamp: startOfDay,
                        remark: 'absent',
                        semester: student.semester,
                        verificationMethod: 'Face Recognition'
                    }));

                // Process present students
                for (let i = lastProcessedCount; i < attendanceRecords.length; i++) {
                    const record = attendanceRecords[i];
                    if (record.timestamp >= startOfDay && record.timestamp < endOfDay) {
                        try {
                            await FaceAttendance.updateOne(
                                {
                                    rollNo: record.rollNo,
                                    timestamp: {
                                        $gte: startOfDay,
                                        $lt: endOfDay
                                    }
                                },
                                {
                                    $set: {
                                        ...record,
                                        verificationMethod: 'Face Recognition'
                                    }
                                },
                                { upsert: true }
                            );
                            successCount++;
                            console.log(`✅ PRESENT: Roll No: ${record.rollNo}, Name: ${record.studentName}`);
                        } catch (err) {
                            errorCount++;
                            console.error(`❌ Error processing record for Roll No: ${record.rollNo}:`, err);
                        }
                    }
                }

                // Process absent students
                for (const absentRecord of absentStudents) {
                    try {
                        await FaceAttendance.updateOne(
                            {
                                rollNo: absentRecord.rollNo,
                                timestamp: {
                                    $gte: startOfDay,
                                    $lt: endOfDay
                                }
                            },
                            {
                                $setOnInsert: absentRecord
                            },
                            { upsert: true }
                        );
                        successCount++;
                        console.log(`⛔ ABSENT: Roll No: ${absentRecord.rollNo}, Name: ${absentRecord.studentName}`);
                    } catch (err) {
                        errorCount++;
                        console.error(`❌ Error processing absent record for Roll No: ${absentRecord.rollNo}:`, err);
                    }
                }
            }

            // Update the last processed count
            lastProcessedCount = attendanceRecords.length;

            console.log(`
🎉 Attendance Update Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Records Processed: ${successCount}
❌ Failed: ${errorCount}
📊 Total Records: ${attendanceRecords.length}
⏰ Time: ${new Date().toLocaleTimeString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            `);

            return {
                success: true,
                message: `Successfully processed ${successCount} records (${errorCount} failed)`
            };
        } else {
            console.log(`
⏰ Attendance Check Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 No new records to process
💾 Total Records in CSV: ${attendanceRecords.length}
⏰ Time: ${new Date().toLocaleTimeString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            `);
            return {
                success: true,
                message: 'No new records to process'
            };
        }

    } catch (error) {
        console.error('❌ Fatal error processing attendance:', error);
        return {
            success: false,
            message: error.message
        };
    }
};

// Modify the startCSVProcessing function:
const startCSVProcessing = () => {
    const INTERVAL = 1 * 60 * 1000; // 1 minute
    
    console.log(`
🚀 Attendance Monitoring Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ Check Interval: 1 minute
📋 First check starting...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    // Clear any existing interval
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
    }

    // Start immediate first check
    processFaceRecognitionCSV().then(() => {
        console.log('📋 Initial check completed');
        
        // Start the interval after first check
        monitoringInterval = setInterval(async () => {
            console.log('\n⏰ Running scheduled check...');
            await processFaceRecognitionCSV();
        }, INTERVAL);
        
        console.log(`✅ Monitoring interval set to ${INTERVAL/1000} seconds`);
    }).catch(error => {
        console.error('❌ Error during initial check:', error);
    });
};

// Modify the initialization function to ensure it only starts once
let isInitialized = false;

export const initializeAttendanceMonitoring = () => {
    if (isInitialized) {
        console.log('⚠️ Attendance monitoring already initialized');
        return;
    }
    
    isInitialized = true;
    startCSVProcessing();
    console.log('✅ Attendance monitoring system initialized');
}; 

export const stopAttendanceMonitoring = () => {
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = 5  * 60 * 1000;
        console.log('⏰ Attendance monitoring stopped');
    } else {
        console.log('⚠️ Attendance monitoring is not running');
    }
};

//get all attendance by date
export const getAttendanceByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        // Validate the date
        if (isNaN(startOfDay.getTime()) || isNaN(endOfDay.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Please use YYYY-MM-DD.'
            });
        }

        // Log the start and end dates for debugging
        console.log(`Fetching attendance records from ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
        
        const attendance = await FaceAttendance.find({
            timestamp: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        });

        // Log the fetched attendance records for debugging
        console.log('Fetched attendance records:', attendance);
        
        res.status(200).json({
            success: true,
            message: "Attendance fetched successfully",
            data: attendance
        });
    } catch (error) {
        console.error('❌ Error fetching attendance:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Add the attendanceFace controller
export const attendanceFace = (req, res) => {
    // Implement the controller logic here
    res.send('Attendance face controller');
};