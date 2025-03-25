import mongoose, {Schema} from "mongoose";


const paymentSchema = new Schema({

    orderId : {
        type : String,
        required : true
    },

    paymentId : {
        type : String,
        required : true
    },

    appointmentDetails : {
        type : Schema.Types.ObjectId,
        ref : "Appointment",
        required : true
    },

    paymentStatus : {
        type : String,
        required : true,
        enum : ["successfull", "failed", "pending", "refunded"]
    },

    recieptId : {
        type : String,
        required : true
    }
}, {
    timestamps : true
})


export const Payment = mongoose.model("Payment", paymentSchema)