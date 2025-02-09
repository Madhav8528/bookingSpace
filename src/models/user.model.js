import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({

    username : {
        type : String,
        required : true,
        lowercase : true,
        trim : true,
        unique : true
    },
    
    firstName : {
        type : String,
        required : true,
        trim : true
    },

    lastName : {
        type : String,
        required : true,
        trim : true
    },

    email : {
        type : String,
        required : true,
        trim : true,
        unique : true
    },

    mobileNumber : {
        type : Number,
        required : true,
        trim : true
    },

    password : {
        type : String,
        require : [true, "Password is required"]
    },

    refreshToken : {
        type : String
    }

},
{
    timestamps : true
})

export const User = mongoose.model("User", userSchema)