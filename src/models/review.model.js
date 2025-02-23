import mongoose, {Schema} from "mongoose";


const reviewSchema = new Schema({

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

    message : {
        type : Text,
        required : true,
        trim : true
    },

    star : {
        type : Number,
        required : true,
        enum : [1, 2, 3, 4, 5]
    }
}, {
    timestamps : true
})


export default Review = mongoose.model("Review", reviewSchema)