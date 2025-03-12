import { Router } from "express";
import { breifProfileDoctor,
         checkDoctorAvailability,
         listDoctors,
         pagination } from "../controllers/appointment.controller.js";
import { Doctor } from "../models/doctor.model.js"

const router = Router()

router.route("/doctor-list").post(pagination(Doctor),listDoctors)
router.route("/doctor-profile/:doctorId").get(breifProfileDoctor)
router.route("/get-availability/:doctorId").get(checkDoctorAvailability)



export default router;