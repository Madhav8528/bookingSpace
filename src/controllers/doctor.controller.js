import { ApiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Doctor } from "../models/doctor.model.js";
import { Otp } from "../models/otp.model.js";
import bcrypt from "bcrypt";
import otpgenerator from "otp-generator";
import nodemailer from "nodemailer";
import twilio from "twilio";
import jwt from "jsonwebtoken";
import { cloudinaryUpload } from "../utils/cloudinary.js";


const generateAccessAndRefreshTokens = async (doctorId) => {
    
    try {
        
        const doctor = await Doctor.findById(doctorId);
        if(!doctor){
            throw new ApiError(401, "No doctor found with this doctorId")
        }
    
        const accessToken = await doctor.generateAccessToken()
        const refreshToken = await doctor.generateRefreshToken()
        if(!accessToken || !refreshToken){
            throw new ApiError(400, "Something went wrong while generation of the doctor tokens")
        }
    
        doctor.refreshToken = refreshToken
        await doctor.save(
            {
                validateBeforeSave : false,
            }
        )
    
        return {accessToken, refreshToken};    
    } catch (error) {
            console.log("Process error while generating access and refresh tokens, Please try again!", error)
    }
}

//tested = Done(success)
const registerDoctor = asyncHandler( async (req, res) => {
    
    const { fullName, specialization, description, charges, email, password, mobileNumber, address,
            availability, otp } = req.body

    if(!otp){

        if([fullName, specialization, description, charges, email, password, mobileNumber, address,
            availability].some((field) => { return String(field).trim() === "" }))
       {
            throw new ApiError(400, "Please provide all the details to register as a doctor")
       }
       console.log("email :", email)
       console.log("mobile no. :", mobileNumber)
    const emailRegex = /^(?!\.)[a-zA-Z0-9._%+-]{1,64}@(?!-)[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/
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

    const existedDoctor = await Doctor.findOne({
        $or : [{email}, {mobileNumber}]
    })
    if(existedDoctor){
        throw new ApiError(400, "Doctor with these details already register, kindly login")
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
         throw new ApiError(402, "Otp is not valid, please register again.")
    }

    const pictureLocalPath = await req.files?.picture[0].path
    const degreeLocalPath = await req.files?.degree[0].path
    const licenceLocalPath = await req.files?.licence[0].path
    if(!degreeLocalPath){
        throw new ApiError(400, "Kindly provide the file to verify your doctor degree identification.")
    }
    if(!licenceLocalPath){
        throw new ApiError(400, "Kindly provide the file to verify your doctor licence.")
    }
    if(!pictureLocalPath){
        throw new ApiError(400, "Kindly provide the picture to continue.")
    }

    const degreeForVerification = await cloudinaryUpload(degreeLocalPath)
    const licenceForVerification = await cloudinaryUpload(licenceLocalPath)
    const picture = await cloudinaryUpload(pictureLocalPath)
    if(!degreeForVerification){
        throw new ApiError(400, "Something went wrong while uploading degree file.")
    }
    if(!licenceForVerification){
        throw new ApiError(400, "Something went wrong while uploading licence file.")
    }
    if(!picture){
        throw new ApiError(400, "Something went wrong while uploading your picture.")
    }

    const doctor = await Doctor.create({
        fullName, specialization, description, charges, email, password, mobileNumber, address,
        availability,
        role : "doctor",
        picture : picture?.url,
        degreeForVerification : degreeForVerification?.url, 
        licenceForVerification : licenceForVerification?.url
    })

    const createdDoctor = await Doctor.findOne({email}).select("-password -refreshToken")
    if(!createdDoctor){
        throw new ApiError(400, "Something went wrong while registering the doctor.")
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
        subject : "Welcome on Booking Space as a doctor",
        text : "Your verification is under process. We will soon update after the verification process based on your submitted documents."
    })
    
    return res.status(200)
    .json( new apiResponse(200, { createdDoctor, VerificationMail }, "You are successfully verified by otp and doctor identity supporting documents are now under verification."))
})

//tested = Done(success)
const loginDoctor = asyncHandler( async (req, res) => {


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

   const doctor = await Doctor.findOne({email})
   if(!doctor){
        throw new ApiError(400, "No doctor find with this email")
   }
   
   const validPassword = await bcrypt.compare(password, doctor.password)
   if(!validPassword){
        throw new ApiError(401, "Please enter a valid password")
   }

   const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(doctor._id)
   const options = {
        secure : true,
        httpOnly : true
   }

   const loggedInDoctor = await Doctor.findById(doctor._id).select("-password -refreshToken")
   if(!loggedInDoctor){
        throw new ApiError(404, "Something went wrong while logging doctor.")
   }

   return res.status(200)
   .cookie("AccessToken", accessToken, options)
   .cookie("RefreshToken", refreshToken, options)
   .json( new apiResponse(200, loggedInDoctor, "Doctor logged in successfully"))
})

//tested = Done(success)
const logoutDoctor = asyncHandler( async (req, res) => {
    
    await Doctor.findByIdAndUpdate(
        req.doctor._id,
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
    .json( new apiResponse(200, "Doctor logged out successfully") )

})

//tested = Done(success)
const getDoctor = asyncHandler( async(req, res) => {

    const doctor = await Doctor.findById(req.doctor?._id).select("-password -RefreshToken")
    if(!doctor){
        throw new ApiError(402, "Kindly login to get doctor details")
    }

    return res.status(200)
    .json( new apiResponse(200, doctor, "Doctor details fetched successfully") )
})

//tested = Done(success)
const changePassword = asyncHandler( async (req, res) => {
    
    const { currentPassword, newPassword } = req.body
    if(!newPassword){
        throw new ApiError(400, "Please provide new password to continue")
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if(passwordRegex.test(newPassword)===false){
        throw new ApiError(400, "Please provide a password with atleast a Uppercase, a special character and a number")
    }

    if(!req.doctor){
        throw new ApiError(402, "Kindly login to change the password")
    }
    const doctor = await Doctor.findById(req.doctor?._id)
    const verifyPassword = await bcrypt.compare(currentPassword, doctor.password)
    if(!verifyPassword){
        throw new ApiError(400, "Current password entered is not correct")
    }
    
    doctor.password = newPassword
    await doctor.save({validateBeforeSave : false})

    return res.status(200)
    .json( new apiResponse(200, "New password set successfully") )

})

//tested = Done(success)
const updateAccessToken = asyncHandler( async (req, res) => {
    
    const token = req.cookies?.RefreshToken
    if(!token){
        throw new ApiError(400, "Refresh token not found for user")
    }

    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
    if(!decodedToken){
        throw new ApiError(501, "Something went wrong while decoding token")
    }

    const doctor = await Doctor.findById(decodedToken?._id)
    if(!doctor){
        throw new ApiError(401, "No doctor found with these details")
    }

    if( token !== doctor.refreshToken ){
        throw new ApiError(402, "Doctor not authorize, kindly login to continue")
    }
    
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(doctor._id)
    const options = {
        secure : true,
        httpOnly : true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json( new apiResponse(200, {accessToken, refreshToken}, "New access token has been generated." ) )
})

//tested = Done(success)
const forgetPassword = asyncHandler( async (req, res) => {
    
    const { email, newPassword, confirmPassword } = req.body
    if(!newPassword && !confirmPassword){
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
    
    const doctor = await Doctor.findOne({email})
    if(newPassword === doctor.password){
        throw new ApiError(401, "This password match with current password, please use a new password then previous one.")
    }

    doctor.password = newPassword
    await doctor.save({validateBeforeSave : false})

    return res.status(200)
    .json(200, "Doctor password updated successfully")
})



export { registerDoctor,
         loginDoctor,
         logoutDoctor,
         getDoctor,
         changePassword,
         updateAccessToken,
         forgetPassword
 }