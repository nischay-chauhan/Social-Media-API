import {  Router } from "express";
import { upload } from "../middleware/multer.middleware";

const router = Router();

router.route("/register").post(upload.single("profilePic"), (req, res) => {
    console.log(req.file)
    res.json("hello")
})