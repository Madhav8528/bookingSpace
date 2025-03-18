import mongoose, {Schema} from "mongoose";


const medicalRecordSchema = new Schema({

    userDetails : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    //after completion of appointment controller
    // prescriptionDetails : {
    //     type : Schema.Types.ObjectId,
    //     ref : "Prescription"
    // },

    Date : {
        type : Date,
        required : true
    },

    doctorDetails : {
        type : Schema.Types.ObjectId,
        ref : "Doctor",
    },
    //after completion of appointment controller
    // appointmentDetails : {
    //     type : Schema.Types.ObjectId,
    //     ref : "Appointment"
    // },

    medicalFiles : {
        type : String,
        required : true
    }
}, {
    timestamps : true
})


export const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema)