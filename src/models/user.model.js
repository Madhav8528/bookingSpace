import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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
    },

    role : {
        type : String,
        //required : true
    }

},
{
    timestamps : true
})

userSchema.pre("save", async function (next) {
    
    if (!this.isModified("password")){
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10)
    next();
})

userSchema.method.generateAccessToken = async () => {
    
    return await jwt.sign({
        _id : this._id,
        username : this.username,
        email : this.email,
        name : this.name
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : "18000000ms"
        }
    )
}

userSchema.method.generateRefreshToken = async () => {
    
    return await jwt.sign({
        _id : this._id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : "10d"
        }
    )
}


export const User = mongoose.model("User", userSchema)