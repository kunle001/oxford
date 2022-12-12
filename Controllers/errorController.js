const AppError = require("../utils/appError");

// FUNCTION FOR HANDLING TOKEN AND MONGOOSE ERRORS
const handleDuplicateErrorDB= (error)=>{
    const message= ` ${error.keyValue.email} is taken already, please try another ${Object.keys(error.keyValue)}` 
    return new AppError(message, 400)  
};

const handleCastErrorDB= (error)=>{
    const message= `Invalid ${error.path}: ${error.value}`
    return new AppError(message, 400)
}

const handleValidationError= (error)=>{
    const message= `${error.errors.name.path}, is either not provided or has the wrong value`
    return new AppError(message, 400)
}

const handleJWTError= (error)=>{
    const message= 'Please Log in'
    return new AppError(message, 400)
}

const handleTokenExpired= (error)=>{
    const message= 'Token Expired , Login again'
    return new AppError(message, 400)
}


const sendErrorDev= (err,res)=>{
    //development error: 
    res.status(err.statusCode).json({
        status: err.status, 
        error: err,
        message: err.message,
        stack: err.stack
    })
};

const sendProdErr= (err, res)=>{

    // Error to be sent to client
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })

    //Hiding Programming error and sending a more friendly error to client
    }else{
    //Logging the error so the developer can see it, even when running in Production mode
        console.error('ERROR💥', err)
    //sendng the a friendlier error to client
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        })
    }
}



module.exports=(err, req, res, next)=>{
    err.statusCode=  err.statusCode || 500
    err.status= err.status || 'error'
    
    if(process.env.MODE==='development'){
        sendErrorDev(err, res)
    }else if (process.env.MODE==='production'){
        
        if(err.code=== 11000){
            error= handleDuplicateErrorDB(err)
        }else if(err.name==='CastError'){
            error= handleCastErrorDB(err)
        }else if(err.name==='ValidationError'){
            error= handleValidationError(err)
        }else if (err.name==='JsonWebTokenError'){
            error= handleJWTError(err)
        }else if(err.name==='TokenExpiredError'){
            error= handleTokenExpired(err)
        }else{
            error=new AppError('something went wrong', 400)
        };
        sendProdErr(error, res)
    }
}
