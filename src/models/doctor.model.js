import mongoose,{Schema} from "mongoose";


const doctorSchema = new Schema({

    fullName : {
        type : String,
        required : true,
        trim : true
    },

    specialization : {
        type : Array,
        required : true,
        trim : true,
    },

    description : {
        type : Text,
        required : true,
        trim : true
    },

    charges : {
        type : Number,
        required : true,
        trim : true,
    },

    Booking : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },

    email : {
        type : String,
        required : true,
        trim : true
    },

    mobileNumber : {
        type : Number,
        required : true,
        trim : true
    },

    address : {
        type : Text,
        required : true,
        trim : true
    },
    //picture and time pending

}, 
{
    timestamps : true
})

export default Doctor = mongoose.model("Doctor", doctorSchema)
