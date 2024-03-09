import {  Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar") , registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT ,logoutUser)

export default router;