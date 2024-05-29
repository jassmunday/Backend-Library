import { asyncHandler } from "../utils/asyncHandler.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import { User } from "../models/user.model.js";
import { fileUploadOnCloudinary } from "../utils/cloudinary.js";
import { ResponseHandler } from "../utils/responseHandler.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ErrorHandler(
            500,
            "Something went wrong while generating referesh and access token"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { fullName, email, username, password } = req.body;
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ErrorHandler(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ErrorHandler(
            409,
            "User with email or username already exists"
        );
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ErrorHandler(400, "Avatar file is required");
    }

    const avatar = await fileUploadOnCloudinary(avatarLocalPath);
    const coverImage = await fileUploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ErrorHandler(400, "Avatar file is required");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ErrorHandler(
            500,
            "Something went wrong while registering the user"
        );
    }

    return res
        .status(201)
        .json(
            new ResponseHandler(
                200,
                createdUser,
                "User registered Successfully"
            )
        );
});

const loginUser = asyncHandler(async (req, res) => {
    console.log(req.body);

    const { username, email, password } = req.body;

    if (!username && !email) {
        throw new ErrorHandler(400, "Username or Email is required");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (!user) {
        throw new ErrorHandler(400, "Username or Email not exists");
    }

    const isPswrdMatches = await user.comparePassword(password);

    if (!isPswrdMatches) {
        throw new ErrorHandler(400, "Invalid Email or Password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
        user._id
    );
    // console.log("Refresh Token: "+refreshToken+ " "+ "Access Token: "+accessToken);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
    };

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ResponseHandler(200, accessToken, "User Logged In"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        { new: true }
    );
    const options = {
        httpOnly: true,
    };
    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ResponseHandler(200, {}, "User Logged OUT"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRequestRefreshToken = req.cookies;

    if (!incomingRequestRefreshToken) {
        throw new ErrorHandler(400, "unauthorized User");
    }
    try {
        const decodedToken = jwt.verify(
            incomingRequestRefreshToken,
            process.env.REFRESH_SECRET_TOKEN
        );

        if (!decodedToken) {
            throw new ErrorHandler(400, "Incorrect Refresh token");
        }

        const user = User.findById(decodedToken?._id);

        if (!decodedToken) {
            throw new ErrorHandler(400, "User Invalid Request");
        }

        if (incomingRequestRefreshToken !== user?.refreshToken) {
            throw new ErrorHandler(400, "Invalid RefreshToken");
        }

        const options = {
            httpOnly: true,
        };

        const { accessToken, newRefreshToken } =
            await generateAccessAndRefereshTokens(decodedUser?._id);
        res.send(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ResponseHandler(
                    200,
                    { accessToken, newRefreshToken },
                    "Access Token Refreshed"
                )
            );
    } catch (error) {
        throw new ErrorHandler(401, error?.message || "Invalid refresh token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ErrorHandler(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ResponseHandler(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ResponseHandler(
                200,
                req.user,
                "User Details Fetched Successfully"
            )
        );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName && !email) {
        throw new ErrorHandler(400, "Please Provide the Details");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ResponseHandler(200, user, "User Updated Successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ErrorHandler(200, "Avatar file is Required");
    }
    const avatar = await fileUploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ErrorHandler(200, "Avatar not Uploaded,Error Occurred While Uploading");
    }
    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        { new: true }
    ).select("-password");

    res.status(200).json(
        new ResponseHandler(200, user, "Avatar Image Updated Successfully")
    );
});

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ErrorHandler(400, "Cover image file is missing")
    }


    const coverImage = await fileUploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ErrorHandler(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ResponseHandler(200, user, "Cover image updated successfully")
    )
})

const getUserChannelProfile = asyncHandler(async(req,res) => {
    const {username} = req.params;
    if(!username){
        throw new ErrorHandler(400,"Profile Does Not Exist")
    }

    const channelInfo = User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },{
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },{
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscriberedTo"
            }
        },{
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },{
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])
    if(!channelInfo.length){
        throw new ErrorHandler(400,"Channel Does not Exist");
    }
    res.status(200).json(
        new ResponseHandler(200,channelInfo[0],"Channel Details Fetched Successfully ")
    )
})

const getWatchHistory = asyncHandler((req,res) =>{
    
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserAvatar
};
