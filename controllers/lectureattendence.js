import LectureAttendence from "../models/lectureattendence.js";

export const createLectureAttendence = async (req, res) => {
    const { rollno, status } = req.body;
    if (!rollno || !status) {
        return res.status(400).json({ message: 'Please fill all the fields' });
    }
    const timestamp = new Date();
    const newAttendence = new LectureAttendence({ rollno, status, timestamp });
    try {
        await newAttendence.save();
        res.status(201).json(newAttendence);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export const updateLectureAttendence = async (req, res) => {
    const { id } = req.params;
    const attendence = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No attendence with id: ${id}`);
    const updatedAttendence = await LectureAttendence.findByIdAndUpdate(id, { ...attendence, id }, { new: true });
    res.json(updatedAttendence);
}

export const getLectureAttendence = async (req, res) => {
    try {
        const attendence = await LectureAttendence.find();
        res.status(200).json(attendence);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}