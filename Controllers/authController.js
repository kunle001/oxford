const catchAsync= require('../utils/catchAsync')
const jwt= require('jsonwebtoken')
const User= require('../Models/userModel')


const signToken= id=>{
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
};

const createSendToken= (user, statusCode, req, res)=>{
    const token= signToken(user._id);

    res.cookie('secretoken', token, {
        httpOnly: true,
        secure: req.secure
    })

    res.status(statusCode).json({
        status: 'success',
        token,
        data:{
            user
        }
    });
};


exports.login=catchAsync(async (req, res, next)=>{
    const {email, password} = req.body;

    if(!email || !password){
        return next(new AppError('please provide your username and password', 400))      
    }

    const user= await User.findOne({email}).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError('Wrong username or password', 400))
    }

    createSendToken(user, 200, req, res)

}); 