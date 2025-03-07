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
const listDoctors = asyncHandler( async (req, res) => {
    
    //this will get list of user and paginate also as queried
    //await pagination(Doctor)
    //console.log(res.pagination);
    res.status(200)
    .json( new apiResponse(200, res.pagination, "Doctors data fetched successfully.") )
})


const breifProfileDoctor = asyncHandler( async (req, res) => {
    
})


const bookAppointment = asyncHandler( async (req, res) => {
    
    
})



export { listDoctors,
         pagination,
         breifProfileDoctor }