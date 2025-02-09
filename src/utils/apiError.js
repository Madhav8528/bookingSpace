
class apiError extends Error{

    constructor(
        statusCode = 404,
        message,
        error = [],
        stack = ""
    ){

        this.statusCode = statusCode
        this.message = message
        this.error = error
        this.data = null
        this.success = false

        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this. this.constructor)
        }
    }
}

export { apiError }