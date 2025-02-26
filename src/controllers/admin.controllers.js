import { Doctor } from "../models/doctor.model";
import { User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { apiResponse } from "../utils/apiResponse";
import nodemailer from "nodemailer";


const doctorRequest = asyncHandler( async ( _ , res) => {
    
    const unverifiedDoctors = await Doctor.find({
        status : "Unverified"
    })
    if(unverifiedDoctors.length === 0){
        throw new ApiError(400, "No doctor request found.")
    }

    return res.status(200)
    .json( new apiResponse(200, unverifiedDoctors, "Doctor list for verification successfully fetched.") )
})

const verifyDoctor = asyncHandler( async (req, res) => {
    
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


const rejectDoctor = asyncHandler( async (req, res) => {
    
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

export { doctorRequest,
         verifyDoctor,
         rejectDoctor
}