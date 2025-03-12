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
        type : String,
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
        type : String,
        required : true,
        trim : true
    },
    
    picture : {
        type : String,
        required : true
    },

    availability : {
        Monday : {
            type : Boolean,
            default : false
        },
        Tuesday : {
            type : Boolean,
            default : false
        },
        Wednesday : {
            type : Boolean,
            default : false
        },
        Thrusday : {
            type : Boolean,
            default : false
        },
        Friday : {
            type : Boolean,
            default : false
        },
        Saturday : {
            type : Boolean,
            default : false
        },
        Sunday : {
            type : Boolean,
            default : false
        },
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
        default : "Unverified",
        enum : ["Unverified", "Verified", "Rejected"]
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

doctorSchema.methods.generateRefreshToken = function () {
   
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
