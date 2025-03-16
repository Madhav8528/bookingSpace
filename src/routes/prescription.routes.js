import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getAllPrescription, uploadPrescription } from "../controllers/prescription.controller.js";


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

router.route("/get-all-prescription").get(verifyJwt, getAllPrescription)


export default router;