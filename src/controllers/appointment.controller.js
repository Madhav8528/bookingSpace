import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.model.js";
import paginate from "mongoose-paginate-v2";


//when user click on book an appointment and list of doctor is shown
const listDoctors = asyncHandler( async (req, res) => {
    
    
    // const profileData = {
    //     name : doctors.fullName,
    //     specialization : doctors.specialization,
    //     picture : doctors.picture,
    //     charges : doctors.charges
    // }
    // console.log(profileData);
    const {page} = req.query.page
    const {limit} = req.query.limit
    const option = {
        page : page,
        limit : limit,
    }
    paginate(Doctor)
    const doctors = Doctor.pa
    if(!doctors){
        throw new ApiError(400, "Something went wrong while fetching doctor list.")
    }
    console.log(doctors);
    
    res.status(200)
    .json( new apiResponse(200, Doctor, "Doctors data fetched successfully.") )

})



export { listDoctors }