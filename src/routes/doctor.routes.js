import { Router } from "express";
import { changePassword, forgetPassword, getDoctor,
         loginDoctor,
         logoutDoctor,
         registerDoctor, 
         updateAccessToken,
         updateDoctorAvailability} from "../controllers/doctor.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwtDoctor } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name : "picture",
            maxCount : 1
        },
        {
            name : "degree",
            maxCount : 1
        },
        {
            name : "licence",
            maxCount : 1
        }
    ]),
    registerDoctor)


router.route("/login").post(loginDoctor)
router.route("/logout").post(verifyJwtDoctor, logoutDoctor)
router.route("/get-doctor").get(verifyJwtDoctor, getDoctor)
router.route("/change-password").post(verifyJwtDoctor, changePassword)
router.route("/refresh-access-token").post(verifyJwtDoctor, updateAccessToken)
router.route("/forgot-password").post(forgetPassword)
router.route("/update-doctor-availability").post(updateDoctorAvailability)

export default router;