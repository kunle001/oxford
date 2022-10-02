const User= require('../Models/userModel')
const AppError = require('../utils/appError')
const catchAsync= require('../utils/catchAsync')

exports.updateProfile= catchAsync(async(req, res, next)=>{
    if(req.body.password|| req.body.confirmPassword){
        return next(new AppError('you cannot update password here', 400))
    };

    const user= await User.findByIdAndUpdate(req.user._id,req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        status: 'success',
        data: user
    })

})