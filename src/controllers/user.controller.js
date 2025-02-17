import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const generateAccessAndRefreshTokens = async (userId) => {
    
    try {
        if(!userId){
            throw new apiError(400, "User Id not found!")
        }
    
        const user = await User.findById(userId);
        if(!user){
            throw new apiError(401, "No user found with this userId")
        }
    
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        if(!accessToken || !refreshToken){
            throw new apiError(400, "Something went wrong while generation of the user")
        }
    
        user.refreshToken = refreshToken
        await user.save(
            {
                validateBeforeSave : false,
            }
        )
    
        return {
                    accessToken, refreshToken
        }       
    } catch (error) {
            console.log("Process error while generating access and refresh tokens, Please try again!")
    }
}


const registerUser = asyncHandler( async (req, res) => {
    
    
    
})