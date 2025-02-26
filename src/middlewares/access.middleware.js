import { ApiError } from "../utils/apiError"


const grantAccess = async (role) => {
    
   return (req, _, next) => {
        try {
            
            if((role === "doctor" || role === "admin") && req.user.role === "patient"){
                throw new ApiError(402, "You are not authorized for admin/doctor access as a patient/user.")
            }
            else if(role === "admin" && req.doctor.role === "doctor"){
                throw new ApiError(402, "You are not authorized for admin access as a doctor.")
            }

            next()

    } catch (error) {
        throw new ApiError(400, "Error in grant access middlewares : ", error)
    }
   }
}


export { grantAccess }