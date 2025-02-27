import mongoose from "mongoose";

let counter = 0;

const subjectSchema = new mongoose.Schema({
    customId: {
        type: String,
        default: () => {
            counter += 1;
            return `cse${String(counter).padStart(3, '0')}`;
        }
    },
    name: {
        type: String,
        required: [true, "Subject name is required"],
        trim: true,
        unique: true
    },
    semester: {
        type: String,
        required: [true, "Semester is required"],
        trim: true
    },
    
    }, {
    timestamps: true
    });

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;
