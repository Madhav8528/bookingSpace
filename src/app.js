import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin : process.env.PORT,
    credentials : true
}))

app.use(express.json({ limit : "20kb" }))
app.use(cookieParser())
app.use(express.urlencoded({ extended : true, limit : "20kb" }))

//routes
import userRoutes from "./routes/user.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import prescriptionRoutes from "./routes/prescription.routes.js";
import medicalRecordsRoutes from "./routes/medicalRecords.routes.js";

app.use("/api/v1/patient", userRoutes)
app.use("/api/v1/doctor", doctorRoutes)
app.use("/api/v1/admin", adminRoutes)
app.use("/api/v1/patient", appointmentRoutes)
app.use("/api/v1/patient", prescriptionRoutes)
app.use("/api/v1/patient", medicalRecordsRoutes)

export { app }