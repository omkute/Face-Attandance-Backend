import Student from "../models/students.js";

// create student
export const createStudent = async (req, res) => {
  const { name, rollNo, semester, avgAttendance, email } = req.body;
  if (!name || !rollNo || !email) {
    return res.status(400).json({
      success: false,
      message: "Name, rollNo, and email are required"
    });
  }

  try {
    const existingStudent = await Student.findOne({ rollNo });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "User Already Exists"
      });
    }

    const student = await Student.create({ name, rollNo, semester, avgAttendance, email });
    return res.status(201).json({
      success: true,
      message: "Student Created Successfully",
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error from backend",
      error
    });
  }
};

// get all students
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json({
      success: true,
      message: "Students fetched successfully",
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// delete student
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// update student
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, rollNo, semester, avgAttendance } = req.body;
    const student = await Student.findByIdAndUpdate(id, { name, rollNo, semester, avgAttendance }, { new: true });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// get student by id
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    res.status(200).json({
      success: true,
      message: "Student fetched successfully",
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// get student by rollNo
export const getStudentByRollNo = async (req, res) => {
  try {
    const { rollNo } = req.params;
    const student = await Student.findOne({ rollNo });
    res.status(200).json({
      success: true,
      message: "Student fetched successfully",
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// get student by name
export const getStudentByName = async (req, res) => {
  try {
    const { name } = req.params;
    const student = await Student.findOne({ name });
    res.status(200).json({
      success: true,
      message: "Student fetched successfully",
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};






