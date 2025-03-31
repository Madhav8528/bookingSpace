import mongoose, {Schema} from "mongoose";


const appointmentSchema = new Schema({
    
    userDetails : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },

    doctorDetails : {
        type : Schema.Types.ObjectId,
        ref : "Doctor",
        required : true
    },

    paymentDetails : {
        type : Schema.Types.ObjectId,
        ref : "Payment",
    },

    queueNo : {
        type : Number,
        required : true,
    },

    queueStatus : {
        type : String,
        enum : ["waiting", "ongoing", "done"]
    },

    appointmentStatus : {
        type : String,
        required : true,
        enum : ["pending", "confirmed", "completed", "cancelled"]
    },

    reasonForVisit : {
        type : String,
        trim : true,
    },

    prescriptionDetails : {
        type : Schema.Types.ObjectId,
        ref : "Prescreption",
    },

    medicalRecordDetails : {
        type : Schema.Types.ObjectId,
        ref : "MedicalRecords"
    },

    date : {
        type : Date,
        required : true
    },

    timeSlot : {
        type : String,
        required : true
    }
},
{
    timestamps : true
})


export const Appointment = mongoose.model("Appointment", appointmentSchema)