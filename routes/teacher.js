

import express from "express";
import { createTeacher, getTeachers, deleteTeacher, updateTeacher, getTeacherById, getTeacherByName } from "../controllers/teacher.js";

const router = express.Router();

router.route("/create").post(createTeacher); 
router.route("/get").get(getTeachers); 
router.route("/:id").delete(deleteTeacher);
router.route("/:id").put(updateTeacher);
router.route("/:id").get(getTeacherById);
router.route("/:name").get(getTeacherByName);


export default router;
