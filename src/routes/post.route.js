import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createPost, getSpecificUserPosts } from "../controllers/post.controller.js";

const router = Router()

router.route("/content").post(verifyJWT , createPost);
router.route("/:id/posts").get(verifyJWT , getSpecificUserPosts)

export default router