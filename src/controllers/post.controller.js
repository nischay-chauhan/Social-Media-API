import Post from "../models/posts.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const createPost = asyncHandler(async(req , res) => {
    const {content} = req.body;
    if(!content.trim()){
        throw new ApiError(400 , "Post Content is Required");
    }
    const newPost = await Post.create({
        content ,
        user: req.user.id
    })

    return res
    .status(201)
    .json(new ApiResponse(200 , newPost , "Post Created SuccessFully"))
})

export {createPost}