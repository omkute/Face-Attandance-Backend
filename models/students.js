import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, "Student name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    
  },
  rollNo: {
    type: Number,
    required: [true, "Roll number is required"],
    unique: true,
    trim: true
  },
  semester: {
    type: String,
    required: [true, "Semester is required"],
    trim: true
  },
  avgAttendance: {
    type: Number,
    default: 0,
    min: [0, "Attendance cannot be less than 0"],
    max: [100, "Attendance cannot be more than 100"]
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate studentId
studentSchema.pre('save', async function(next) {
  if (!this.studentId) {
    // Find the highest existing studentId
    const highestStudent = await this.constructor.findOne({}, { studentId: 1 })
      .sort({ studentId: -1 });
    
    let nextNumber = 1;
    if (highestStudent && highestStudent.studentId) {
      // Extract the number from the existing highest studentId
      const currentNumber = parseInt(highestStudent.studentId.replace('AECS', ''));
      nextNumber = currentNumber + 1;
    }
    
    // Generate new studentId with padding (e.g., AECS001)
    this.studentId = `AECS${nextNumber.toString().padStart(3, '0')}`;
  }
  next();
});

const Student = mongoose.model('Student', studentSchema);

export default Student;