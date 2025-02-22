import { ApiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Otp } from "../models/otp.model.js";
import bcrypt from "bcrypt";
import otpgenerator from "otp-generator";
import nodemailer from "nodemailer";
import twilio from "twilio";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    
    try {
        
        const user = await User.findById(userId);
        if(!user){
            throw new ApiError(401, "No user found with this userId")
        }
    
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        if(!accessToken || !refreshToken){
            throw new ApiError(400, "Something went wrong while generation of the user")
        }
    
        user.refreshToken = refreshToken
        await user.save(
            {
                validateBeforeSave : false,
            }
        )
    
        return {accessToken, refreshToken};    
    } catch (error) {
            console.log("Process error while generating access and refresh tokens, Please try again!", error)
    }
}


const registerWithOtpGenerationUser = asyncHandler( async (req, res) => {
    
    //get details from user
    //verify those details
    //check existing user
    //create entry in db
    //remove hidden fields from the response
    //check for the successfull creation of user
    //return res
    
    const { username, firstName, lastName, password, email, mobileNumber, otp } = req.body

    if(!otp){

    if([username, firstName, lastName, password, email, mobileNumber]
        .some((field) => 
              { return field.trim()=== "" }))

   {
        throw new ApiError(400, "Please provide all the details to register")
   }
    
    const emailRegex = /^(?!\.)[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if(emailRegex.test(email)===false){
        throw new ApiError(400, "Please provide a valid email")
    }

    const mobileRegex = /^\d{10}$/
    if(mobileRegex.test(mobileNumber)===false){
        throw new ApiError(400, "Please provide a valid mobile number")
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if(passwordRegex.test(password)===false){
        throw new ApiError(400, "Please provide a password with atleast a Uppercase, a special character and a number")
    }

    const existedUser = await User.findOne({
        $or : [{email}, {mobileNumber}]
    })
    if(existedUser){
        throw new ApiError(402, "User already exist with this email or mobile number")
    }

    const otp = otpgenerator.generate(6, {
                  digits : true, 
                  upperCaseAlphabets : false,
                  lowerCaseAlphabets : false,
                  specialChars : false
    })
    if(!otp){
        throw new ApiError(500, "Something went wrong with otp generation")
    }

    const OTP = await Otp.create({
        otp,
        email
    })
    if(!OTP){
        throw new ApiError(400, "Something went wrong with Otp data model")
    }

    const twilio_SID = process.env.TWILIO_ACCOUNT_SID
    const twilio_AuthToken = process.env.TWILIO_AUTH_TOKEN

    const client = twilio(twilio_SID, twilio_AuthToken)
    client.messages
    .create({
        body : `Your Booking Space Otp verification code is : ${otp}`,
        to : `+91${mobileNumber}`,
        from : '+12342399234'
    })
    .catch(
        (err) => {
            throw new ApiError(502, "Something went wrong with mobile otp", err)
        }
    )

    const transporter = nodemailer.createTransport({
        service : "gmail",
        auth : {
            user : "madhavv8528@gmail.com",
            pass : process.env.GMAIL_PASS
        }
    })

    const otpMail = await transporter.sendMail({
        from : "madhavv8528@gmail.com",
        to : email,
        subject : "OTP Verification for registering on Booking Space",
        text : `Your Booking Space Otp verification code is : ${otp}`
    })
    if(!otpMail){
        throw new ApiError(501, "Error while sending Otp to email")
    }

    return res.status(200)
    .json( new apiResponse(200, "Otp successfully sent to your email and mobile number."))
}
    
    const verifyOtp = await Otp.findOne( { 
        $or : [{otp}, {email}]
    })
    if(!verifyOtp){
        await Otp.deleteOne({otp})
        throw new ApiError(402, "Otp is not valid, please register again.")
    }

    const user = await User.create({
        username,
        firstName,
        lastName, 
        password, 
        email, 
        mobileNumber
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(404, "Something went wrong while registering user.")
    }

    await Otp.deleteOne({otp})

    const transporter = nodemailer.createTransport({
        service : "gmail",
        auth : {
            user : "madhavv8528@gmail.com",
            pass : process.env.GMAIL_PASS
        }
    })

    const VerificationMail = await transporter.sendMail({
        from : "madhavv8528@gmail.com",
        to : verifyOtp.email,
        subject : "Welcome on Booking Space",
        text : "You are now verified user!"
    })

    return res.status(200)
    .json( new apiResponse(200, { createdUser, VerificationMail }, "You are successfully verified and registered"))
    
})


const loginUser = asyncHandler( async (req, res) => {
    
    //get email and password
    //verify fields
    //find user with that email
    //if user not found make them register first
    //check its password using bcrypt
    //if password invalid make unauthorize request
    //else login the user
    //return login user instance and tokens also as cookies

    const { email, password } = req.body

    if([password, email]
        .some((field) => 
              { return field.trim()=== "" }))
   {
        throw new ApiError(400, "Please provide email and password to login")
   }

   const emailRegex = /^(?!\.)[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
   if(emailRegex.test(email)===false){
        throw new ApiError(400, "Please provide a valid email")
   }

   const user = await User.findOne({email})
   if(!user){
        throw new ApiError(400, "No user find with this email")
   }
   
   const validPassword = async (password) => {
        return bcrypt.compare(password, user.password)
   }
   if(!validPassword){
        throw new ApiError(401, "Please enter a valid password")
   }

   const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
   const options = {
        secure : true,
        httpOnly : true
   }

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
   if(!loggedInUser){
        throw new ApiError(404, "Something went wrong while logging user.")
   }

   return res.status(200)
   .cookie("AccessToken", accessToken, options)
   .cookie("RefreshToken", refreshToken, options)
   .json( new apiResponse(200, loggedInUser, "User logged in successfully") )
})


const logout = asyncHandler( async (req, res) => {
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
           $unset : {
            refreshToken : 1
        }
    },
    {
        new : true
    })

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .clearCookie("AccessToken", options)
    .clearCookie("RefreshToken", options)
    .json( new apiResponse(200, "User logged out successfully") )

})


const getUser = asyncHandler( async(req, res) => {

    const user = await User.findById(req.user?._id).select("-password -RefreshToken")
    if(!user){
        throw new ApiError(402, "Kindly login to get user details")
    }

    return res.status(200)
    .json( new apiResponse(200, user, "User details fetched successfully") )
})


const changePassword = asyncHandler( async (req, res) => {
    
    const { currentPassword, newPassword } = req.body
    if(!newPassword){
        throw new ApiError(400, "Please provide new password to continue")
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if(passwordRegex.test(newPassword)===false){
        throw new ApiError(400, "Please provide a password with atleast a Uppercase, a special character and a number")
    }

    if(!req.user){
        throw new ApiError(402, "Kindly login to change the password")
    }

    const verifyPassword = await bcrypt.compare(currentPassword, req.user.password)
    if(!verifyPassword){
        throw new ApiError(400, "Current password entered is not correct")
    }
    const user = await User.findById(req.user?._id)
    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res.status(200)
    .json( new apiResponse(200, "New password set successfully") )

})


const updateAccessToken = asyncHandler( async (req, res) => {
    
    const token = req.cookies?.RefreshToken
    if(!token){
        throw new ApiError(400, "Refresh token not found for user")
    }

    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
    if(!decodedToken){
        throw new ApiError(501, "Something went wrong while decoding token")
    }

    const user = await User.findById(decodedToken?._id)
    if(!user){
        throw new ApiError(401, "No user found with these details")
    }

    if( token !== user.refreshToken ){
        throw new ApiError(402, "User not authorize, kindly login to continue")
    }
    
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    const options = {
        secure : true,
        httpOnly : true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json( new apiResponse(200, {accessToken, newRefreshToken}, "New access token has been generated." ) )
})


const forgetPassword = asyncHandler( async (req, res) => {
    
    const { email, newPassword, confirmPassword } = req.body
    if(!newPassword){
    if(!email){
        throw new ApiError(400, "Please enter email to recover password")
    }

    const transporter = nodemailer.createTransport({
        service : "gmail",
        auth : {
            user : "madhavv8528@gmail.com",
            pass : process.env.GMAIL_PASS
        }
    })

    const recoverPassword = transporter.sendMail({
        from : "madhavv8528@gmail.com",
        to : email,
        subject : "Password recover email for Booking Space",
        text : "Please click on the following link to recover your password : linkHere"
    })
    if(!recoverPassword){
        throw new ApiError(400, "Something went wrong, Please enter the email again")
    }
}
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if(passwordRegex.test(newPassword)===false){
        throw new ApiError(400, "Please provide a password with atleast a Uppercase, a special character and a number")
    }
    if(newPassword !== confirmPassword){
        throw new ApiError(400, "Password doesnt match with confirm password")
    }

    const user = await User.findOne({email})
    
    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res.status(200)
    .json(200, "User password updated successfully")
})



export { registerWithOtpGenerationUser,
         loginUser,
         logout,
         getUser,
         changePassword,
         updateAccessToken,
         forgetPassword
 }