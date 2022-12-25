const Tutor= require('../Models/tutorModel')
const catchAsync= require('../utils/catchAsync')
const Course= require('../Models/courseModel')
const Application= require('../Models/applicationModel')
const User= require('../Models/userModel')
const Email= require('../utils/email')
const AppError = require('../utils/appError')
const crypto= require('crypto')
const Class = require('../Models/classModel');
const multer= require('multer');
const sharp= require('sharp')

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadCV = upload.single('CV');

exports.resizeCV = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `application-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/applications/${req.file.filename}`);

  next();
});


exports.findOneTutor= catchAsync(async(req, res, next)=>{
    const tutor= await Tutor.findById(req.params.tutorId)

    res.status(200).json({
        status: 'success',
        data: tutor
    })
});

exports.applyTutor= catchAsync(async(req, res, next)=>{
  if(!req.file) return next(new AppError('provide your CV', 400))
  req.body.user= req.user.id;
  req.body.CV= req.file.filename
  const application= await Application.create(req.body)

  const staffs= await User.find({role:'admin'})

  const url=`${req.protocol}://${req.get(
    'host'
  )}/tutors/applications`

  staffs.forEach(async admin => {
      await new Email(admin, url).sendApplication()
  });

  res.status(201).json({
    status: 'success',
    data: application
  })
});

exports.getApplications= catchAsync(async(req, res, next)=>{
  const applications= await Application.find()


  if(!applications) return next(new AppError('something went wrong', 400))

  res.status(200).json({
    status: 'success',
    data: applications
  })
});


exports.approveApplication= catchAsync(async(req, res, next)=>{
  const application= await Application.findByIdAndUpdate(req.params.applicationId, 
    {status: 'approved'}, {new: true, runValidators:true});

  if(application){
    try{
      const approvalToken= application.createApprovalToken();
      await application.save()

      const signUpUrl= `${req.protocol}://${req.get('host')}/api/v1/tutors/signup/${approvalToken}`

      await new Email(application,signUpUrl).sendApproval()
    }catch(err){
      application.approvalToken= undefined;
      application.approvalTokenExpires= undefined;
      await application.save({validateBeforeSave:false});
      console.log(err)
    }
  }else{
    return next(new AppError('this application does not exist on the database', 404))
  }

  res.status(200).json({
    status: 'success',
    message: 'Congratulations Your Application is successful',
    data: application
  })
});

exports.disapproveApplication= catchAsync(async(req, res, next)=>{
  const application= await Application.findByIdAndUpdate(req.params.applicationId, 
    {status: 'disapproved'}, {new: true, runValidators:true});
      const url= 'Thanks'

      await new Email(application,url).sendDisapproval()

      res.status(200).json({
        status: 'success',
        data: application
      })
})


exports.checkValidToken= catchAsync(async(req, res, next)=>{
  const hashedToken= crypto.createHash('sha256').update(req.params.approvalToken).digest('hex')

  const user = await Application.findOne({
      approvalToken: hashedToken,
      approvalTokenExpires: { $gt: Date.now() }
    });
  
  if(!user) return next(new AppError('Wrong or Expired Token', 400))

  next();
})
  
exports.updateProfile= catchAsync(async(req, res, next)=>{
      if(req.body.password|| req.body.confirmPassword){
          return next(new AppError('you cannot update password here', 400))
      };

    // 3) Update user document
    const updatedTutor = await Tutor.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true
    });
    if (req.body.courses){
      await Course.findByIdAndUpdate(req.body.courses[0],{$addToSet: {tutors:updatedTutor.id}},{new: true});
    }
  
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedTutor
      }
    });
  
  });



