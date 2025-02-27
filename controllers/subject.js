import Subject from "../models/subjects.js";
import mongoose from "mongoose";

// create subject
export const createSubject = async (req, res) => {
    try {
        const { name, semester } = req.body;
        // Validate teacher IDs 
        if (!name || !semester) {
            return res.status(400).json({ message: "Name and semester are required" });
        }
        const subexists = await Subject.findOne({ name });
        if (subexists) {
            return res.status(400).json({ message: "Subject already exists" });
        }
        const subject = new Subject({
            name,
            semester,
        });
        await subject.save();
        res.status(201).json(subject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


export const createSubjectv2 = async (req, res) => {
    try {
        const { name, semester } = req.body;
        // Validate teacher IDs
        if (!name || !semester) {
            return res.status(400).json({ message: "Name and semester are required" });
        }
        const subject = new Subject({
            name,
            semester,
        });
        await subject.save();
        res.status(201).json(subject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// get all subjects
export const getSubjects = async (_, res) => {
    try {
        const subjects = await Subject.find();
        res.status(200).json({
            success: true,
            message: "Subjects fetched successfully",
            data: subjects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// delete subject
export const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const subject = await Subject.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "Subject deleted successfully",
            data: subject
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};  

// update subject
export const updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, credits } = req.body;
        const subject = await Subject.findByIdAndUpdate(id, { name, code, credits }, { new: true });    
        res.status(200).json({
            success: true,
            message: "Subject updated successfully",
            data: subject
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const getSubjectById = async(req, res)=>{
    try {
        const {id}= req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subject ID"
            });
        }
        const subject = await Subject.findById(id);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Subject fetched successfully",
            data: subject
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
