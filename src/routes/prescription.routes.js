import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { deletePrescription,
         getAllPrescription,
         getPrescription,
         uploadPrescription } from "../controllers/prescription.controller.js";


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

router.route("/get-prescription/:prescriptionId").get(verifyJwt, getPrescription)

router.route("/delete-prescription/:prescriptionId").delete(verifyJwt, deletePrescription)

export default router;