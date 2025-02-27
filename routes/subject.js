import express from "express";
import { createSubject, getSubjects, deleteSubject, updateSubject, getSubjectById } from "../controllers/subject.js";

const router = express.Router();

router.route("/create").post(createSubject);
router.route("/get").get(getSubjects); 
router.route("/:id").delete(deleteSubject);
router.route("/:id").put(updateSubject);
router.route("/:id").get(getSubjectById);


export default router;
