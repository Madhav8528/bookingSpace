import { Router } from "express";
import { bookAppointment,
         breifProfileDoctor,
         checkDoctorAvailability,
         createPaymentOrder,
         listDoctors,
         pagination, 
         verifyPayment} from "../controllers/appointment.controller.js";
import { Doctor } from "../models/doctor.model.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/doctor-list").post(pagination(Doctor),listDoctors)

router.route("/doctor-profile/:doctorId").get(breifProfileDoctor)

router.route("/get-availability/:doctorId").get(checkDoctorAvailability)

router.route("/book-appointment/:doctorId").post(verifyJwt ,bookAppointment)

router.route("/create-order/:appointmentId").post(createPaymentOrder)

router.route("/payment-confirmation").post(verifyPayment)

export default router;