import { Doctor } from "../models/doctor.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import nodemailer from "nodemailer";


//tested = Done(success)
const doctorsRequest = asyncHandler( async ( _ , res) => {
    
    const unverifiedDoctors = await Doctor.find({
        status : "Unverified"
    })
    if(unverifiedDoctors.length === 0){
        throw new ApiError(400, "No doctor request found.")
    }

    return res.status(200)
    .json( new apiResponse(200, unverifiedDoctors, "Doctor list for verification successfully fetched.") )
})

//tested = Done(success)
const doctorDetails = asyncHandler( async (req, res) => {
    
    const { doctorId } = req.params
    if(!doctorId){
        throw new ApiError(400, "Something went wrong with the url.")
    }

    const doctor = await Doctor.findById(doctorId)
    if(!doctor){
        throw new ApiError(402, "No doctor found with this doctorId")
    }

    const degree = doctor.degreeForVerification
    const licence = doctor.licenceForVerification
    if(!degree || !licence){
        throw new ApiError(401, "unable to fetch verification document for this doctor.")
    }

    res.status(200)
    .json( new apiResponse(200, { degree, licence }, "Doctor's degree and licence fetched, kindly verify."))
})

//tested = Done(success)
const verifyDoctor = asyncHandler( async (req, res) => {
    
    
    const { doctorId } = req.params
    if(!doctorId){
        throw new ApiError(400, "Something went wrong with the url.")
    }

    const doctor = await Doctor.findById(doctorId)
    if(!doctor){
        throw new ApiError(402, "No doctor found with this doctorId")
    }

    doctor.status = "Verified"
    await doctor.save({validateBeforeSave : false})

    const transporter = nodemailer.createTransport({
            service : "gmail",
            auth : {
                user : "madhavv8528@gmail.com",
                pass : process.env.GMAIL_PASS
            }
        })
    
    const verifiedDoctorMail = await transporter.sendMail({
        from : "madhavv8528@gmail.com",
        to : doctor.email,
        subject : "Your Doctor Profile Verified Successfully",
        text : "You are verified as a doctor now and can access the platform."
    })
    if(!verifiedDoctorMail){
        throw new ApiError(501, "Error while sending Otp to email")
    }

    res.status(200)
    .json( new apiResponse(200, doctor, "Doctor has been verified now") )
})

//tested = Done(success)
const rejectDoctor = asyncHandler( async (req, res) => {
    
    const { doctorId } = req.params
    if(!doctorId){
        throw new ApiError(400, "Something went wrong with the url.")
    }

    const doctor = await Doctor.findById(doctorId)
    if(!doctor){
        throw new ApiError(402, "No doctor found with this doctorId")
    }

    doctor.status = "Rejected"
    await doctor.save({validateBeforeSave : false})

    const transporter = nodemailer.createTransport({
        service : "gmail",
        auth : {
            user : "madhavv8528@gmail.com",
            pass : process.env.GMAIL_PASS
        }
    })

    const rejectedDoctorMail = await transporter.sendMail({
        from : "madhavv8528@gmail.com",
        to : doctor.email,
        subject : "Your Doctor Profile is Rejected",
        text : "Due to unvalid documents submission your profile is rejescted as a doctor. Kindly contact support cell in case of any queries."
    })
    if(!rejectedDoctorMail){
        throw new ApiError(501, "Error while sending Otp to email")
    }

    res.status(200)
    .json( new apiResponse(200, doctor, "Doctor profile is rejected") )

})

export { doctorsRequest,
         doctorDetails,
         verifyDoctor,
         rejectDoctor
}