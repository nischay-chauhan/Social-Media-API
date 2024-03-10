import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createPost, deletePost, getSpecificUserPosts, updatePost } from "../controllers/post.controller.js";

const router = Router()

router.route("/content").post(verifyJWT , createPost);
router.route("/:id/posts").get(verifyJWT , getSpecificUserPosts)
router.route("/:id/update").patch(verifyJWT  , updatePost)
router.route("/:id/delete").delete(verifyJWT , deletePost)
export default router