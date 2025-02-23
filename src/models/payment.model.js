import mongoose, {mongo, Schema} from "mongoose";


const paymentSchema = new Schema({

    userDetails : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },

    appointmentDetails : {
        type : Schema.Types.ObjectId,
        ref : "Appointment",
        required : true
    },

    amount : {
        type : Number,
        required : true,
        trim : true
    },

    paymentStatus : {
        type : String,
        required : true,
        enum : ["successfull", "failed", "pending", "refunded"]
    },

    paymentMethods : {
        type : String,
        required : true,
        enum : ["UPI", "Debit Card", "Credit Card", "Other"]
    },

    transactinId : {
        type : String,
        required : true
    }
}, {
    timestamps : true
})


export default Payment = mongoose.model("Payment", paymentSchema)