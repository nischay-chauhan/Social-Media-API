import {  Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { loginUser, registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(upload.single("avatar") , registerUser);
router.route("/login").post(loginUser);

export default router;