import { Router } from "express";
import { listDoctors } from "../controllers/appointment.controller.js";


const router = Router()

router.route("/doctor-list").post(listDoctors)

export default router;