import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.model.js";
import { User } from "../models/user.model.js";
import paginate from "mongoose-paginate-v2";
import { Prescription } from "../models/prescription.model.js";
import { MedicalRecord } from "../models/medicalRecord.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";

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

//apply jwt auth middleware
const bookAppointment = asyncHandler( async (req, res) => {
    
    const { reasonForVisit, timeSlot } = req.body
    const { doctorId } = req.params
    
    const { user } = req.user
    if(!user){
        throw new ApiError(402, "Please login or register to continue.")
    }

    const date = new Date(req.body.date)
    if(isNaN(date)){
        throw new ApiError(400, "Invalid date format, please provide date as MM/DD/YYYY.")
    }
    const day = date.getDay()

    const doctor = await Doctor.findById(doctorId)
    if(doctor){
        throw new ApiError(400, "Doctor can't be fetched from the db, check url.")
    }
    let checkDayAvailability = null
    for(let i in doctor.availability){
        if(i === day){
            checkDayAvailability = doctor.availability[i]
        }
    }
    if(checkDayAvailability === null){
        throw new ApiError(400, "Something went wrong while validating doctor availability from db.")
    }

    //provide checkDoctorAvailability api to direct user.
    if(checkDayAvailability === false){
        throw new ApiError(400, "Doctor is'nt available for this day kindly check availability first.")
    }

    let currentCounter = null
    const { appointmentCounter } = doctor.appointmentCounter
    for( let i in appointmentCounter){
        if( i === day ){
            currentCounter = appointmentCounter[i]
        }
    }
    if(currentCounter === null){
        throw new ApiError(400, "Something went wrong while fetching currentCounter from db.")
    }

    const queueNo = currentCounter + 1

    const prescription = await Prescription.find({
        $and : [
            { doctorDetails : doctorId },
            { userDetails : user._id }
        ]
    })
    if(!prescription){
        throw new ApiError(400, "No prescription found for this user.")
    }

    const medicalRecord = await MedicalRecord.find({
        $and : [
            { doctorDetails : doctorId },
            { userDetails : user._id }
        ] 
    })
    if(!medicalRecord){
        throw new ApiError(400, "No medical record found for this user.")
    }

    const appointment = await Appointment.create({

        userDetails : user._id,
        doctorDetails : doctorId,
        queueNo : queueNo,
        appointmentStatus : "pending",
        reasonForVisit : reasonForVisit,
        prescriptionDetails : prescription._id,
        medicalRecordDetails : medicalRecord._id,
        date : date,
        timeSlot : timeSlot

    })
    if(!appointment){
        throw new ApiError(400, "Something went wrong while creating appointment db instance.")
    }

    return res.status(201)
    .json( new apiResponse(201, appointment, "Appointment details submitted, kindly proceed with payments.") )

})

const razorpay = new Razorpay({
    key_id : process.env.RAZORPAY_API_KEY_ID,
    key_secret : process.env.RAZORPAY_API_SECRET
})

const createPaymentOrder = asyncHandler( async (req, res) => {
    
    const { appointmentId } = req.params
    if(!appointmentId){
        throw new ApiError(400, "Something went wrong with the url.")
    }

    const appointment = await Appointment.findById(appointmentId)
    if(!appointment){
        throw new ApiError(400, "Something went wrong while fetching appointment.")
    }
    
    const doctor = await Doctor.findById(appointment.doctorDetails)
    if(!doctor){
        throw new ApiError(400, "Something went wrong while fetching doctor.")
    }

    const data = {}
    data.appointmentId = appointmentId
    data.date = appointment.date
    data.timeSlot = timeSlot
    data.queueNo = queueNo
    data.doctorName = doctor.fullName
    data.charges = doctor.charges

    const options = {
        amount : amount*100, //as in INR currency amount subunits in paises so to convert to rupees
        currency : "INR",
        receipt: `order_recieptId_${appointment._id}`
    }

   const order = razorpay.orders.create(options)
   if(!order){
        throw new ApiError(400, "Sommething went wrong while creating razorpay order.")
   }

   return res.status(201)
   .json( new apiResponse(200, {data, order}, "Order created successfully, redirecting to payment page.") )
})


const verifyPayment = asyncHandler( async (req, res) => {
    
    const { order_id, payment_id, signature } = req.body
    if(!order_id || !payment_id || !signature){
        throw new ApiError(500, "Something went wrong to get details from body.")
    }

    const generatedToken = crypto.createHmac("sha256", process.env.RAZORPAY_API_SECRET)
                                 .update(`${order_id} | ${payment_id}`)
                                 .digest("hex")
    if(!generatedToken){
        throw new ApiError(500, "Something went wrong while creating token to verify signature.")
    }

    if(generatedToken !== signature){
        throw new ApiError(402, "Payment failed, kindly retry.")
    }


                
})


export { listDoctors,
         pagination,
         breifProfileDoctor,
         bookAppointment,
         checkDoctorAvailability,
         createPaymentOrder,
         verifyPayment
       }