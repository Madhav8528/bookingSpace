import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { uploadPrescription } from "../controllers/prescription.controller.js";


const router = Router()


router.route("/upload-prescription").post(verifyJwt, 
    upload.fields([
        {
            name : "file",
            maxCount : 2
        }
    ]),
    uploadPrescription
)


export default router;