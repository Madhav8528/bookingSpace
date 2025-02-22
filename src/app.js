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

app.use("/api/v1/patient", userRoutes)


export { app }