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
        required : true
    },

    queueNo : {
        type : Number,
        required : true,
        trim : true
    },

    appointmentStatus : {
        type : String,
        required : true,
        enum : ["pending", "confirmed", "completed", "cancelled"]
    },

    reasonForVisit : {
        type : Text,
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


export default Appointment = mongoose.model("Appointment", appointmentSchema)