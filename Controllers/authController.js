const catchAsync= require('../utils/catchAsync')
const jwt= require('jsonwebtoken')
const User= require('../Models/userModel')
const Email= require('../utils/email');
const AppError = require('../utils/appError');
const crypto= require('crypto')
const Tutor= require('../Models/tutorModel')


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
const date= new Date()


exports.signUp = async (req, res, next)=>{
    try{


        const user= await User.create(req.body);
        const url= '127.0.0.1:3000'
        await new Email(user, url).sendWelcome()
        createSendToken(user, 201, req, res)

    }catch(err){
        console.log(err)
        res.status(500).json({
            errorMessage: err
        })
    }
    
};


exports.signUpTutor = async (req, res, next)=>{
    try{
        const tutor= await Tutor.create(req.body);
        const url= '127.0.0.1:3000'
        await new Email(tutor, url).sendWelcome()
        createSendToken(tutor, 201, req, res)

    }catch(err){
        console.log(err)
        res.status(500).json({
            errorMessage: err
        })
    }
    
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    
    if (!user) {
      return next(new AppError('There is no user with email address.', 404));
    }
  
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
  
    // 3) Send it to user's email
    try {
      const resetURL = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/resetPassword/${resetToken}`;
      await new Email(user, resetURL).sendPasswordReset();
  
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      console.log(err)
  
      return next(
        new AppError('There was an error sending the email. Try again later!'),
        400
      );
    }
  });


exports.resetPassword= catchAsync(async (req, res, next)=>{

    const hashedToken= crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });


    if(!user){
        res.status(404).json({
            message: "This password reset token is expired or wrong"
        })
    }

    user.passwordResetExpires= undefined;
    user.passwordResetToken= undefined;
    user.password= req.body.password;
    user.confirmPassword= req.body.confirmPassword;
    user.passwordChangedAt= Date.now()
    await user.save();

    new Email(user,'127.0.0.1:3000').sendPasswordChanged()

    createSendToken(user, 200, req, res)

});


exports.protect= catchAsync(async (req, res, next)=>{

    if(req.cookies){
            // verify if token is real
            const decoded= await (jwt.verify)(
                req.cookies.secretoken,
                process.env.JWT_SECRET
            );

            // check if user still exists
            const currentUser= await User.findById(decoded.id);  

            if(!currentUser){
                return (next(new AppError('Login again', 404)))
            };

            //check if user changed password after the token was issued

            if(currentUser.changedPasswordAfter(decoded.iat)){
                return (next(new AppError('password has been changed please login again', 400)))
            }

            //if all these are coditions are met then there is a logged in user, therfore store user info in locals
            req.user= currentUser
            res.locals.user= currentUser


            //Allow next middleware
            return next();
    }
    //Else if there are no saved cookies, user isnt logged in
    next(new AppError('user is not logged in', 400))

});


