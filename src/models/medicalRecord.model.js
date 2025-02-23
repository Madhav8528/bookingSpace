import mongoose, {Schema} from "mongoose";


const medicalRecordSchema = new Schema({

    userDetails : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },

    prescriptionDetails : {
        type : Schema.Types.ObjectId,
        ref : "Prescription"
    },

    Date : {
        type : Date,
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

    //file array implement
}, {
    timestamps : true
})


export default MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema)