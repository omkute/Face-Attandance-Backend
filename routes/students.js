import express from "express";
import { createStudent, getStudents, deleteStudent, updateStudent, getStudentById, getStudentByName } from "../controllers/student.js";

const router = express.Router();

router.route("/create").post(createStudent);
router.route("/get").get(getStudents);
router.route("/delete/:id").delete(deleteStudent);
router.route("/update/:id").put(updateStudent);
router.route("/:id").get(getStudentById);
router.route("/:name").get(getStudentByName);

export default router;  