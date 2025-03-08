import { Router } from "express";
import { breifProfileDoctor,
         listDoctors,
         pagination } from "../controllers/appointment.controller.js";
import { Doctor } from "../models/doctor.model.js"

const router = Router()

router.route("/doctor-list").post(pagination(Doctor),listDoctors)
router.route("/doctor-profile/:doctorId").get(breifProfileDoctor)


export default router;