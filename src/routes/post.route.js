import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createPost } from "../controllers/post.controller.js";

const router = Router()

router.route("/content").post(verifyJWT , createPost);

export default router