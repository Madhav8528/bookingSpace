import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteMedicalRecord,
         getAllMedicalRecords,
         getMedicalRecords,
         uploadMedicalRecords } from "../controllers/medicalRecords.controller.js";


const router = Router()

router.route("/upload-medical-record").post(verifyJwt,
    upload.fields([{
        name : "medicalFiles",
        maxCount : 2
    }]),
    uploadMedicalRecords
)

router.route("/get-all-medical-record").get(verifyJwt, getAllMedicalRecords)

router.route("/get-medical-record/:medicalRecordId").get(getMedicalRecords)

router.route("/delete-medical-record/:medicalRecordId").delete(deleteMedicalRecord)

export default router;