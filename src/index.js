import { app } from "./app.js";
import dotenv from "dotenv";
import { databaseConnection } from "./db/index.js";

dotenv.config({
    src : "./.env"
})

databaseConnection()
.then(
    app.listen(process.env.PORT || 7000, () => {
        console.log(`App server is runinng on : ${process.env.PORT}`)
    })
)
.catch((error)=>{
    console.log("Error while connecting to the server", error)
})