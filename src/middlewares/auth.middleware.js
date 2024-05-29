import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ErrorHandler } from "../utils/errorHandler.js";
import jwt from 'jsonwebtoken';

export const verifyJWTToken = asyncHandler(async (req,res,next) => {

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
        if(!token){
            return new ErrorHandler(400,"Unauthorized Request");
        }
        
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET_TOKEN);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user){
            return new ErrorHandler(400,"User Not Authorized");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ErrorHandler(400,"Invalid access Token")
    }
})