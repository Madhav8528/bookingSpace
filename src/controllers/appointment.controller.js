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
import { Payment } from "../models/payment.model.js";

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

//testing = Done(Success)
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
//testing = Done(Success)
const bookAppointment = asyncHandler( async (req, res) => {
    
    //time slot will be taken as string from UI.
    const { reasonForVisit, timeSlot } = req.body
    const { doctorId } = req.params
    
    const userId = req.user._id
    if(!userId){
        throw new ApiError(402, "Please login or register to continue.")
    }

    const date = new Date(req.body.date)
    const day = date.getDay()
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    if(isNaN(date)){
        throw new ApiError(400, "Invalid date format, please provide date as MM/DD/YYYY.")
    }
    //console.log(doctorId);
    
    const doctor = await Doctor.findById(doctorId)
    if(!doctor){
        throw new ApiError(400, "Doctor can't be fetched from the db, check url.")
    }
    //console.log(day);
    
    let checkDayAvailability = null
    for(let i in doctor.availability){
        if(i === days[day]){
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
    //console.log(checkDayAvailability)

    let currentCounter = null
    for( let i in doctor.appointmentCounter){
        if( i === days[day] ){
            currentCounter = doctor.appointmentCounter[i]
        }
    }
    if(currentCounter === null){
        throw new ApiError(400, "Something went wrong while fetching currentCounter from db.")
    }

    const queueNo = currentCounter + 1
    
    const prescription = await Prescription.find({
        $and : [
            { doctorDetails : doctorId },
            { userDetails : userId }
        ]
    })
    if(!prescription){
        throw new ApiError(400, "No prescription found for this user.")
    }
    //console.log(prescription);
    

    const medicalRecord = await MedicalRecord.find({
        $and : [
            { doctorDetails : doctorId },
            { userDetails : userId }
        ] 
    })
    if(!medicalRecord){
        throw new ApiError(400, "No medical record found for this user.")
    }
    //console.log(medicalRecord);
    

    const appointment = await Appointment.create({

        userDetails : userId,
        doctorDetails : doctorId,
        queueNo : queueNo,
        appointmentStatus : "pending",
        reasonForVisit : reasonForVisit,
        prescriptionDetails : prescription[0]._id,
        medicalRecordDetails : medicalRecord[0]._id,
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

//testing = Done(Success)
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

    const data = {
    appointmentId : appointmentId,
    date : appointment.date,
    timeSlot : appointment.timeSlot,
    queueNo : appointment.queueNo,
    doctorName : doctor.fullName,
    charges : doctor.charges
    }
    
    const options = {
        amount : data.charges*100, //as in INR currency amount subunits in paises so to convert to rupees
        currency : "INR",
        receipt: `order_recieptId_${appointment._id}`
    }

    try {
        const order = await razorpay.orders.create(options)
        return res.status(201).json(
            new apiResponse(200, { data, order }, "Order created successfully, redirecting to payment page.")
        );
    } catch (err) {
        throw new ApiError(500, "Error while creating payment order.", err);
    }
})

//testing from frontend
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

    const order = await razorpay.orders.fetch(order_id)
    if(!order){
        throw new ApiError(400, "No order found with the current orderId.")
    }

    const appointmentId =  order.receipt.split("order_recieptId_")[1]

    if(generatedToken !== signature){
        //create failed payment db instance
        const failedPayment = await Payment.create({
            orderId : order_id,
            paymentId : payment_id,
            appointmentDetails : appointmentId,
            paymentStatus : "failed",
            recieptId : order.receipt
        })

        return res.status(402)
        .json( new apiResponse(402, failedPayment, "Payment failed"))
    }

    //payment successfull, create db instance of payment
    const successPayment = await Payment.create({
        orderId : order_id,
        paymentId : payment_id,
        appointmentDetails : appointmentId,
        paymentStatus : "successfull",
        recieptId : order.receipt
    })

    return res.status(200)
    .json( new apiResponse(200, successPayment, "Payment successfull."))           
})


export { listDoctors,
         pagination,
         breifProfileDoctor,
         bookAppointment,
         checkDoctorAvailability,
         createPaymentOrder,
         verifyPayment
       }