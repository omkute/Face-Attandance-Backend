import { Details } from "../models/details.js";

export const getDetails = async (req, res) => {
    try {
        const details = await Details.find();
        res.status(200).json(details);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export const createDetail = async (req, res) => {
    const { department, year, semester, subject } = req.body;
    const detail = new Details({ department, year, semester, subject });
    await detail.save();
    res.status(201).json(detail);
}