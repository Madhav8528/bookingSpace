import { Router } from "express";
import { doctorDetails,
         doctorsRequest, 
         rejectDoctor, 
         verifyDoctor} from "../controllers/admin.controllers.js";


const router = Router()

router.route("/doctor-request").get(doctorsRequest)
router.route("/doctor-detail/:doctorId").post(doctorDetails)
router.route("/verify-doctor/:doctorId").post(verifyDoctor)
router.route("/reject-doctor/:doctorId").post(rejectDoctor)

export default router;