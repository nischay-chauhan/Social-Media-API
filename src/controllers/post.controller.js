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

    const isPostCreatd = await Post.findById(newPost._id)

    if(!isPostCreatd){
        throw new ApiError(500 , "Something went wrong while creating post")
    }

    return res
    .status(201)
    .json(new ApiResponse(200 , newPost , "Post Created SuccessFully"))
})


const getSpecificUserPosts = asyncHandler(async(req , res) => {
    const userId = req.params.id;
    if(!userId){
        throw new ApiError(400 , "Invalid user Id or User Id is Required");
    }

    let { page = 1, pageSize = 10 } = req.query;
    page = parseInt(page);
    pageSize = parseInt(pageSize);

    const skip = (page - 1) * pageSize;

    const posts = await Post.find({ user: userId })
                             .populate({
                                 path: 'user',
                                 select: '-password -refreshToken'
                             })
                             .skip(skip)
                             .limit(pageSize);

    if(!posts){
        throw new ApiError(500 , "Something went wrong while fetching posts");
    }

    return res.status(200).json(new ApiResponse(200 , posts , "Posts fetched successfully"));
});


export {createPost , getSpecificUserPosts}