import { Router } from "express";
import { listDoctors, pagination } from "../controllers/appointment.controller.js";
import { Doctor } from "../models/doctor.model.js"

const router = Router()

router.route("/doctor-list").post(pagination(Doctor),listDoctors)

export default router;