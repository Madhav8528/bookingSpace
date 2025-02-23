import mongoose, {Schema} from "mongoose";


const prescriptionSchema = new Schema({

    userDetails : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },

    doctorDetails : {
        type : Schema.Types.ObjectId,
        ref : "Doctor",
    },

    appointmentDetails : {
        type : Schema.Types.ObjectId,
        ref : "Appointment"
    },

    date : {
        type : Date,
        required : true
    },

    //files implement
}, {
    timestamps : true
})



export default Prescription = mongoose.model("Prescription", prescriptionSchema)