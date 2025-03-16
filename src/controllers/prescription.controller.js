import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Prescription } from "../models/prescription.model.js";
import { Doctor } from "../models/doctor.model.js";
import { cloudinaryUpload } from "../utils/cloudinary.js";

//use multer cloudinary and verifyjwt auth
//tesing = Done(success)
const uploadPrescription = asyncHandler( async (req, res) => {
    
    const { doctorEmail, date} = req.body
    const userId  = req?.user._id
    //console.log(userId);
    
    if(!userId){
        throw new ApiError(401, "Please login to upload prescription.")
    }

    const data = {}
    //show in UI that if doctor is of portal then only provide email else no need
    if(doctorEmail){

        const doctor = await Doctor.findOne({email : doctorEmail})
        if(!doctor){
            throw new ApiError(401, "No doctor found with this email, kindly recheck")
        }

        data.doctorId = doctor._id
    }

    const fileLocalPath = await req.files?.file[0]?.path
    if(!fileLocalPath){
        throw new ApiError(500, "Something wrong while uploading prescription file.")
    }

    const fileUpload = await cloudinaryUpload(fileLocalPath)
    if(!fileUpload){
        throw new ApiError(500, "Something got wrong with cloudinary on prescriptionn file")
    }

    const prescription = await Prescription.create({
        userDetails : userId,
        doctorDetails : data.doctorId,
        date : date || Date.now(),
        file : fileUpload?.url
    })
    if(!prescription){
        throw new ApiError(500, "Something went wrong while creating db entry")
    }

    return res.status(200)
    .json( new apiResponse(200, prescription, "Prescription uploaded successfully."))
})

//tesing = Done(success)
const getAllPrescription = asyncHandler( async (req, res) => {
    
    if(!req?.user){
        throw new ApiError(401, "Kindly login to view your prescription.")
    }

    const userId = req?.user._id
    //console.log(userId);
    
    const prescriptionList = await Prescription.find({
        userDetails : userId
    })
    //console.log(prescriptionList);
    
    if(!prescriptionList){
        throw new ApiError(400, "No prescription found for this user.")
    }

    return res.status(200)
    .json( new apiResponse(200, prescriptionList, "All the user prescription fetched successfully.") )
})


export { uploadPrescription,
         getAllPrescription
       }