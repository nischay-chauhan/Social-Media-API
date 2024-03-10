import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createPost, deletePost, getSocialFeedPosts, getSpecificUserPosts, updatePost } from "../controllers/post.controller.js";

const router = Router()

router.route("/content").post(verifyJWT , createPost);
router.route("/:id/posts").get(verifyJWT , getSpecificUserPosts)
router.route("/:id/update").patch(verifyJWT  , updatePost)
router.route("/:id/delete").delete(verifyJWT , deletePost)
router.route("/feed").get(verifyJWT , getSocialFeedPosts)
export default router