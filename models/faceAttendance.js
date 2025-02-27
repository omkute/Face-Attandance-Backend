import e from "express";
import mongoose from "mongoose";

const faceAttendanceSchema = new mongoose.Schema({
    rollNo: {
        type: Number,
        required: true,
        min: 1,
        max: 85,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer'
        }
    },
    studentName: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
        validate: {
            validator: function(v) {
                return v <= new Date();
            },
            message: 'Timestamp cannot be in the future'
        },
        get: v => v.toISOString(),
        set: v => new Date(v).toISOString()
    },
    remark: {
        type: String,
        enum: ['present', 'absent'],
        default: 'absent'
    },
    processedAt: {
        type: Date,
        default: () => new Date().toISOString()
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8,
    },
    type: {
        type: String,
        enum: ['university'],
        default: 'university'
    },
    verificationMethod: {
        type: String,
        default: 'Face Recognition'
    }
}, {
    timestamps: true
});

// Compound index to prevent exact duplicates
faceAttendanceSchema.index({ rollNo: 1, timestamp: 1 }, { unique: true });

// Add a method to check for duplicate entries within a time window
faceAttendanceSchema.statics.checkDuplicateInTimeWindow = async function(rollNo, timestamp, windowMinutes = 30) {
    const windowStart = new Date(timestamp.getTime() - (windowMinutes * 60000));
    const windowEnd = new Date(timestamp.getTime() + (windowMinutes * 60000));
    
    return await this.findOne({
        rollNo,
        timestamp: {
            $gte: windowStart,
            $lte: windowEnd
        }
    });
};

export const FaceAttendance = mongoose.model("FaceAttendance", faceAttendanceSchema); 
export default FaceAttendance;