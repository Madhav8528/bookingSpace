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

    date : {
        type : Date,
        required : true
    },

    file : {
        type : String,
        required : true
    }
}, {
    timestamps : true
})



export const Prescription = mongoose.model("Prescription", prescriptionSchema)