import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Doctor } from "../models/doctor.model.js";


export const verifyJwt = asyncHandler( async (req, _, next) => {
    
    try {
        const token = req.cookies?.AccessToken
        if(!token){
            throw new ApiError(401, "Access token not found, kindly login")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(501, "No user can be found with this token")
        }
    
        req.user = user
        next();
    } catch (error) {
        throw new ApiError(500, "Something went wrong with jwt middleware", error)
    }
})

export const verifyJwtDoctor = asyncHandler( async (req, _, next) => {
    
    try {
        const token = req.cookies?.AccessToken
        if(!token){
            throw new ApiError(401, "Access token not found, kindly login")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const doctor = await Doctor.findById(decodedToken?._id).select("-password -refreshToken")
        if(!doctor){
            throw new ApiError(501, "No doctor can be found with this token")
        }
    
        req.doctor = doctor
        next();
    } catch (error) {
        throw new ApiError(500, "Something went wrong with jwt middleware", error)
    }
})