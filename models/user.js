import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['admin', 'clerk', 'classincharge'],
    required: true,
    lowercase: true
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }], // For teachers
});

export const User = mongoose.model("User", userSchema);
