import { Router } from "express";
import {loginUser, 
        registerWithOtpGenerationUser, 
         
 } from "../controllers/user.controller.js";


const router = Router();

router.route("/register-otp").post(registerWithOtpGenerationUser)
router.route("/login").post(loginUser)
 

export default router;