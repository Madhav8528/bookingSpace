import { Router } from "express";
import {changePassword,
        getUser,
        loginUser, 
        logout, 
        registerWithOtpGenerationUser, 
         
 } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js"

const router = Router();

router.route("/register-otp").post(registerWithOtpGenerationUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJwt, logout)
router.route("/getUser").get(getUser)
router.route("/change-password").post(changePassword)


export default router;