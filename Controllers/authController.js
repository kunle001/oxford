const catchAsync= require('../utils/catchAsync')
const jwt= require('jsonwebtoken')
const User= require('../Models/userModel')
const Email= require('../utils/email');
const AppError = require('../utils/appError');
const crypto= require('crypto')
const Tutor= require('../Models/tutorModel');
const passport = require('passport')
const facebookStrategy= require('passport-facebook').Strategy



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
    const tutor= await Tutor.findOne({email}).select('+password')

    if (user && (await user.correctPassword(password, user.password))){
        createSendToken(user, 200, req, res)
    }else if(tutor && (await tutor.correctPassword(password, tutor.password))){
        //Logging in tutor
        createSendToken(tutor, 200, req, res)
    }else{
        return next(new AppError('Wrong password', 400))
    }

}); 

exports.sigupFacebook= catchAsync(async(req, res, next)=>{

    passport.use(new facebookStrategy({
        clientID: "1153882575565229",
        clientSecret: "eb0d0c3f7f8db3d89fe28f7a58455979",
        callbackURL: "http://127.0.0.1:5000/api/v1/course",
        profileFields: ['id', 'displayName', 'name', 'gender',"picture.type(large)", "email" ]
    },//facebook will send back the token and profile 
    async function(token, refreshToken, profile, done){
            const data= {
                id: profile.id,
                token,
                name: profile.name.givenName+' '+profile.name.familyName,
                email: profile.emails[0].value,
                gender:profile.gender,
                photo: profile.photos[0].value
            }
            const user= await User.create(data)
            console.log(user)

            if(err){
             console.log(err) 
             throw err;
            }    
            console.log(user)
            return done(null,  user)

    }));


    passport.serializeUser(function(user, done){
        done(null, user.id)
    })
    
    passport.deserializeUser(async function(id, done){

        await User.findById(id, function(err,user){
            done(err,user)
        })
    });

    console.log(passport)
    passport.authenticate('facebook',{scope:'email'})

    res.status(201).json({
        data: passport
    })

})

exports.signUp = async (req, res, next)=>{
    try{
        const user= await User.create(req.body);
        const url = `${req.protocol}://${req.get(
            'host'
          )}/course`
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
        const url = `${req.protocol}://${req.get(
            'host'
          )}/api/v1/users/course`
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
    const tutor= await Tutor.findOne({email: req.body.email })
    
    if (!user && !tutor) {
      return next(new AppError('There is no user with email address.', 404));
    }
  

  
    // 3) Send it to user's email
    if (user){
        
        try {
            // 2) Generate the random reset token
            const resetToken = user.createPasswordResetToken();
            await user.save({ validateBeforeSave: false });

            /////
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

    }else{
        try {
            // 2) Generate the random reset token
            const resetToken = tutor.createPasswordResetToken();
            await tutor.save({ validateBeforeSave: false });

            ////
            const resetURL = `${req.protocol}://${req.get(
              'host'
            )}/api/v1/users/resetPassword/${resetToken}`;
            await new Email(tutor, resetURL).sendPasswordReset();
        
            res.status(200).json({
              status: 'success',
              message: 'Token sent to email!'
            });
          } catch (err) {
            tutor.passwordResetToken = undefined;
            tutor.passwordResetExpires = undefined;
            await tutor.save({ validateBeforeSave: false });
            console.log(err)
        
            return next(
              new AppError('There was an error sending the email. Try again later!'),
              400
            );
          }
    }

  });


exports.resetPassword= catchAsync(async (req, res, next)=>{

    const hashedToken= crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });
    
    const tutor = await Tutor.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });


    if(user){
        user.passwordResetExpires= undefined;
        user.passwordResetToken= undefined;
        user.password= req.body.password;
        user.confirmPassword= req.body.confirmPassword;
        user.passwordChangedAt= Date.now()
        await user.save();
    
        new Email(user,'127.0.0.1:3000').sendPasswordChanged()
    
        createSendToken(user, 200, req, res)
    }else if (tutor){
        tutor.passwordResetExpires= undefined;
        tutor.passwordResetToken= undefined;
        tutor.password= req.body.password;
        tutor.confirmPassword= req.body.confirmPassword;
        tutor.passwordChangedAt= Date.now()
        await tutor.save();
    
        new Email(tutor,'127.0.0.1:3000').sendPasswordChanged()
    
        createSendToken(tutor, 200, req, res)
    }else{
        res.status(404).json({
            message: "This password reset token is expired or wrong"
        })
    }

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
            const currentTutor= await Tutor.findById(decoded.id)

            if(!currentUser && !currentTutor){
                return (next(new AppError('Login again', 404)))
            };

            //check if user changed password after the token was issued
            if(currentUser){
                if(!currentUser.changedPasswordAfter(decoded.iat)){
                    req.user= currentUser
                    res.locals.user= currentUser
                }
            }else if(!currentTutor.changedPasswordAfter(decoded.iat)){
                req.user= currentTutor
                res.locals.user= currentTutor
            }else{
                return (next(new AppError('password has been changed please login again', 400)))
            }

            //Allow next middleware
            return next();
    }
    //Else if there are no saved cookies, user isnt logged in
    next(new AppError('user is not logged in', 400))

});


exports.RestrictTo = (...roles) => {

    return (req, res, next) => {
        // const user= User.findById(req.params)
        const role= req.user.role
      // roles ['admin', 'lead-guide']. role='user'
      if (!roles.includes(role)) {
        res.status(403).send({
            message: `User with your role: ${role} cannot access this page \n this page is Highly restricted`
        })
      }
  
      next();
    };
  };



