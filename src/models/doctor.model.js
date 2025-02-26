import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
        //required : true
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

    password : {
        type : String,
        required : true,
        trim : true
    },

    address : {
        type : Text,
        required : true,
        trim : true
    },
    
    picture : {
        type : String,
        required : true
    },

    availability : {
        type : String,
        required : true,
        trim : true
    },

    degreeForVerification : {
        type : String,
        required : true
    },

    licenceForVerification : {
        type : String,
        required : true
    },

    status : {
        type : String,
        required : true,
        default : "Unverified"
    },
    
    role : {
        type : String,
        required : true,
        enum : ["admin", "patient", "doctor"]
    },

    refreshToken : {
        type : String
    }

}, 
{
    timestamps : true
})

doctorSchema.pre("save", async function (next) {
    
    if (!this.isModified("password")){
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10)
    next();
})

doctorSchema.methods.generateAccessToken = function (){
    
    const payload = {
        _id : this._id,
        email : this.email,
        fullName : this.fullName
    }
    return jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : "18000000ms"
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
   
    const payload = {
        _id : this._id,
    }
    return jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : "10d"
        }
    )
}


export const Doctor = mongoose.model("Doctor", doctorSchema)
