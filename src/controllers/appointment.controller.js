import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.model.js";
import paginate from "mongoose-paginate-v2";

//a fuction to paginate result when required, can also use mongoose aggregate-paginate library
function pagination(model) {

    return async (req, res, next) => {

        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)

        const startIndex = (page-1) * limit
        const endIndex = page * limit

        const result = {}

        if(startIndex > 0){
            result.previous = {
                page :  page - 1,
                limit : limit
            }
        }

        if(endIndex < await model.countDocuments().exec()){
            result.next = {
                page :  page + 1,
                limit : limit
            }
        }

        try{

            result.result = await model.find().limit(limit).skip(startIndex).exec()
            res.pagination = result
            next()
        }
        catch(err){
            throw new ApiError(400, "Error during pagination", err)
        }
    }
}


//testing = Done(Success)
//when user click on book an appointment and list of doctor is shown
//can add filters also after
const listDoctors = asyncHandler( async (_, res) => {
    
    //this will get list of user and paginate also as queried
    //await pagination(Doctor)
    //console.log(res.pagination);
    const doctors = res.pagination.result
    console.log(doctors);
    
    const verifiedDoctors = doctors.filter(doctor => doctor.status === "Verified")


    res.status(200)
    .json( new apiResponse(200, verifiedDoctors, "Doctors data fetched successfully.") )
})


//testing = Done(Success)
const breifProfileDoctor = asyncHandler( async (req, res) => {
    
    const { doctorId } = req.params
    if(!doctorId){
        throw new ApiError(400, "Something went wrong with the url")
    }

    const doctor = await Doctor.findById(doctorId).select("-password -refreshToken")
    if(!doctor){
        throw new ApiError(401, "Something went wrong while finding the doctor from db")
    }

    res.status(200)
    .json( new apiResponse(200, doctor, "Doctor details fetched successfully"))
})


const checkDoctorAvailability = asyncHandler( async (req, res) => {
    
    const { doctorId } = req.params
    if(!doctorId){
        throw new ApiError(501, "The request made cannot be completed due to url error")
    }

    const doctor = await Doctor.findById(doctorId)
    if(!doctor){
        throw new ApiError(402, "No account found with this doctorId.")
    }

    return res.status(200)
    .json( new apiResponse(200, doctor.availability, "Doctor availability fetched successfully.") )
})


const bookAppointment = asyncHandler( async (req, res) => {
    
    
})



export { listDoctors,
         pagination,
         breifProfileDoctor,
         bookAppointment,
         checkDoctorAvailability }