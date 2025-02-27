import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Teacher name is required"],
    trim: true
  },
  teacherId: {
    type: String,
    unique: true,
    default: function() {
      return 'T' + Math.random().toString(36).substr(2, 8).toUpperCase();
    }
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, "At least one subject is required"]
  }],
  semesters: [{
    type: String,
    required: [true, "At least one semester is required"]
  }],
}, {
  timestamps: true
});

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;