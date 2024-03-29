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

  const user = await User.findOne({ email: email.toLowerCase() });

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

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?.id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  console.log(avatarLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Please select an image");
  }

  try {
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
      throw new ApiError(500, "Unable to upload image on Cloudinary");
    }

    const prevUser = await User.findById(req.user?.id);
    //   console.log("PrevUser", prevUser);
    const prevAvatar = prevUser.avatar;
    //   console.log("prevAvatar", prevAvatar);

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      {
        $set: {
          avatar: avatar.url,
        },
      },
      { new: true }
    ).select("-password");

    const avatarPublicId = avatar.url.split("/").pop().split(".")[0];
    //   console.log("avatarPublicId", avatarPublicId);
    const prevAvatarPublicId = prevAvatar
      ? prevAvatar.split("/").pop().split(".")[0]
      : null;
    //   console.log("prevAvatarPublicId", prevAvatarPublicId);

    if (prevAvatar && avatarPublicId !== prevAvatarPublicId) {
      await removeProfilePic(prevAvatarPublicId);
      console.log("Successfully removed previous avatar from Cloudinary");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Avatar updated successfully"));
  } catch (error) {
    console.error("Error updating avatar:", error.message);
    throw new ApiError(500, "Error updating avatar");
  }
});

const followUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "Invalid User Id or User Id is Required");
  }

  const UserToFollow = await User.findById(userId);
  if (!UserToFollow) {
    throw new ApiError(404, "User to Follow not  found");
  }

  if (req.user.id === userId) {
    throw new ApiError(400, "You cannot follow yourself");
  }
  if (req.user.following.includes(userId)) {
    throw new ApiError(400, "You are already following this user");
  }

  req.user.following.push(userId);
  const updatedUser = await req.user.save();
  if (!updatedUser) {
    throw new ApiError(500, "Something went wrong while following user");
  }

  UserToFollow.followers.push(req.user.id);
  const updatedUserToFollow = await UserToFollow.save();

  if (!updatedUserToFollow) {
    throw new ApiError(500, "Something went wrong while following user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User followed successfully"));
});

const unfollowUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User Id is required");
  }

  const userToUnfollow = await User.findById(userId);

  if (req.user.id == userId) {
    throw new ApiError(400, "You cannot unfollow yourself");
  }

  if (!userToUnfollow) {
    throw new ApiError(404, "User to unfollow not found");
  }

  if (!req.user.following.includes(userId)) {
    throw new ApiError(400, "You are not following this user");
  }

  req.user.following = req.user.following.filter(
    (id) => id.toString() !== userId
  );
  await req.user.save();

  userToUnfollow.followers = userToUnfollow.followers.filter(
    (id) => id.toString() !== req.user._id.toString()
  );
  const updatedUserToUnfollow = await userToUnfollow.save();
  if (!updatedUserToUnfollow) {
    throw new ApiError(500, "Something went wrong while unfollowing user");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Successfully unfollowed user"));
});

const getFollowing = asyncHandler(async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const followingCount = req.user.following.length;

  const following = await User.find({ _id: { $in: req.user.following } })
    .select("fullName username avatar")
    .skip(skip)
    .limit(pageSize);
  if(!following){
    throw new ApiError(500, "Something went wrong while fetching following users");
  }
  const totalPages = Math.ceil(followingCount / pageSize);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { following, totalPages },
        "List of users followed by the current user"
      )
    );
});

const getFollowers = asyncHandler(async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const followersCount = req.user.followers.length;

  const followers = await User.find({ _id: { $in: req.user.followers } })
    .select("fullName username avatar")
    .skip(skip)
    .limit(pageSize);
    
  if(!followers){
    throw new ApiError(500, "Something went wrong while fetching followers");
  }
  const totalPages = Math.ceil(followersCount / pageSize);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { followers, totalPages },
        "List of users following the current user"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};

/* 65ec8c4693da675e9d700b16 */
