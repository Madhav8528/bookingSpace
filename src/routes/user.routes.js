import { Router } from "express";
import {changePassword,
        forgetPassword,
        getUser,
        loginUser, 
        logout, 
        registerWithOtpGenerationUser,
        updateAccessToken, 
         
 } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js"

const router = Router();

router.route("/register-otp").post(registerWithOtpGenerationUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJwt, logout)
router.route("/getUser").get(verifyJwt, getUser)
router.route("/change-password").post(verifyJwt, changePassword)
router.route("/refresh-access-token").post(updateAccessToken)
router.route("/forgot-password").post(forgetPassword)


export default router;