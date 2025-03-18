import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { MedicalRecord } from "../models/medicalRecord.model.js";
import { Doctor } from "../models/doctor.model.js";
import { cloudinaryUpload } from "../utils/cloudinary.js";

//show in UI to merge all records and then upload
//testing = Done(success)
const uploadMedicalRecords = asyncHandler( async (req, res) => {
    
    const { doctorEmail } = req.body

    const userId = req.user._id
    if(!userId){
        throw new ApiError(401, "Kindly login to upload medical records.")
    }

    const data = {}
    //if record not linked to doctor then no need of doctor email.
    if(doctorEmail){
        const doctor = await Doctor.findOne({email : doctorEmail})
        if(!doctor){
            throw new ApiError(401, "No doctor found with this email, kindly recheck")
        }

        data.doctorId = doctor._id
    }

    const medicalFileLocalPath = await req.files?.medicalFiles[0].path
    if(!medicalFileLocalPath){
        throw new ApiError(400, "No file found to be uploaded for medical record.")
    }

    const medicalFile = await cloudinaryUpload(medicalFileLocalPath)
    if(!medicalFile){
        throw new ApiError(500, "Something went wrong while uploading file to cloudinary.")
    }

    const medicalRecord = await MedicalRecord.create({
        userDetails : userId,
        Date : Date.now(),
        doctorDetails : data.doctorId,
        medicalFiles : medicalFile.url
    })
    if(!medicalRecord){
        throw new ApiError(500, "Something went wrong while uploading medical records to cloudinary.")
    }

    return res.status(200)
    .json( new apiResponse(200, medicalRecord, "Medical record uploaded successfully.") )
})

//testing = Done(success)
const getAllMedicalRecords = asyncHandler( async (req, res) => {
    
    const userId = req.user._id
    if(!userId){
        throw new ApiError(401, "Kindly login to view your medical records.")
    }

    const medicalRecords = await MedicalRecord.find({
        userDetails : userId
    })
    if(!medicalRecords){
        throw new ApiError(400, "No medical record found for this user.")
    }

    return res.status(200)
    .json( new apiResponse(200, medicalRecords, "Medcial records fetched successfully.") )
})

//testing = Done(success)
const getMedicalRecords = asyncHandler( async (req, res) => {
    
    const { medicalRecordId } = req.params
    if(!medicalRecordId){
        throw new ApiError(500, "Something went wrong with the url.")
    }

    const medicalRecord = await MedicalRecord.findById(medicalRecordId)
    if(!medicalRecord){
        throw new ApiError(400, "No prescription found with this prescriptionId.")
    }

    return res.status(200)
    .json( new apiResponse(200, medicalRecord, "Medical record fetched successfully.") )
})

//testing = Done(success)
const deleteMedicalRecord = asyncHandler( async (req, res) => {
    
    const { medicalRecordId } = req.params
    if(!medicalRecordId){
        throw new ApiError(500, "Something went wrong with the url.")
    }

    await MedicalRecord.findByIdAndDelete(medicalRecordId)
    //console.log(deletePrescription);
    
    return res.status(200)
    .json( new apiResponse(200, "Medical record successfully deleted.") )
})


export { uploadMedicalRecords,
         getAllMedicalRecords,
         getMedicalRecords,
         deleteMedicalRecord
       }