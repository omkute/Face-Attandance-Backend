import mongoose from "mongoose";

const lectureAttendenceSchema = new mongoose.Schema({
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
    timestamp: {
        type: Date,
        required: true,
        validate: {
            validator: function(v) {
                return v <= new Date();
            },
            message: 'Timestamp cannot be in the future'
        }
    },
    status: {
        type: Boolean,
        enum: ['present', 'absent'],
        default: 'absent',
        required: true
    },
    processedAt: {
        type: Date,
        default: Date.now
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'University',
        default: 'lecture'
        
    },
    verificationMethod: {
        type: String,
        default: 'teacher'
    }
}, {
    timestamps: true
}); // Schema for lecture attendence    

const LectureAttendence = mongoose.model('LectureAttendence', lectureAttendenceSchema);

export default LectureAttendence; 