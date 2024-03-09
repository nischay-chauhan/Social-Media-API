import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessAndRefereshTokens = async (userId) => {
    try {
      const user = await User.findById(userId);
      // console.log(user)
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      // console.log('accessToken' , accessToken)
      // console.log("refreshToken" , refreshAccessToken);
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });
  
      return { accessToken, refreshToken };
    } catch (error) {
      throw new ApiError(
        500,
        "Something went wrong while generating refresh and access token"
      );
    }
  };

const registerUser = asyncHandler(async (req, res) => {
    console.log(req.body);
  
    const { fullName, email, username, password } = req.body;
  
    if (
      [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
      throw new ApiError(400, "All fields are required");
    }
  
    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });
  
    if (existedUser) {
      throw new ApiError(409, "User with email or username already exists");
    }
  
    const avatarFile = req.file; 
    console.log("avatar File", avatarFile);
  
    const avatarLocalPath = avatarFile ? avatarFile.path : "";
    console.log("avatarLocalPath:", avatarLocalPath);
  
    if (avatarLocalPath === "") {
      throw new ApiError(400, "AvatarLocalpath file is required");
    }
  
    const avatar = await uploadOnCloudinary(avatarLocalPath);
  
    if (!avatar) {
      throw new ApiError(400, "Avatar file is required");
    }
  
    const user = await User.create({
      fullName,
      avatar: avatar.url,
      email,
      password,
      username: username.toLowerCase(),
    });
  
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
  
    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user");
    }
  
    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
  
    if (!email) {
      throw new ApiError(400, " email is required");
    }
  
    const user = await User.findOne({email : email.toLowerCase()});
  
    if (!user) {
      throw new ApiError(404, "User does not exist");
    }
  
    const isPasswordValid = await user.isPasswordCorrect(password);
  
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials");
    }
  
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id
    );
  
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
  
    const options = {
      httpOnly: true,
      secure: true,
    };
  
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "User logged In Successfully"
        )
      );
  });
  

export {registerUser , loginUser}