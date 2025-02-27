import express from "express";
import { loginUser, registerUser, logoutUser, getUserInfo } from "../controllers/user.js";
import { isAuthenticated } from '../middleware/isAuthenticated.js';

const router = express.Router();

// router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/").get(isAuthenticated);
router.route("/profile").get(getUserInfo);



export default router;
