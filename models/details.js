import mongoose from "mongoose";

const detailsSchema = new mongoose.Schema({
  department: { type: String, required: true },
  year: { type: String, required: true },
  semester: { type: String, required: true },
  subject: { type: String, required: true },
});

export const Details = mongoose.model("Details", detailsSchema);