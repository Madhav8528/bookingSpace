import mongoose from "mongoose";

const DB_NAME = "Booking Space"

const databaseConnection = async () => {
    
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`App is connected with db with connection host : ${connection.connection.host}`)
    } catch (error) {
        console.log("Error while connecting to db", error)
    }
}

export { databaseConnection }