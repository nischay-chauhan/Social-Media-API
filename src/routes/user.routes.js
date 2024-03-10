import {  Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { followUser, getCurrentUser, loginUser, logoutUser, registerUser, unfollowUser, updateAccountDetails, updateUserAvatar } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar") , registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT ,logoutUser)
router.route("/profile").get(verifyJWT , getCurrentUser)
router.route("/update-account").patch(verifyJWT , updateAccountDetails);

router.route("/avatar").patch(verifyJWT , upload.single("avatar") , updateUserAvatar)


router.route("/follow/:userId").post( verifyJWT , followUser);
router.route("/unfollow/:userId").post( verifyJWT , unfollowUser);

export default router;