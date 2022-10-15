const Tutor= require('../Models/tutorModel')
const catchAsync= require('../utils/catchAsync')
const Course= require('../Models/courseModel')

exports.findOneTutor= catchAsync(async(req, res, next)=>{
    const tutor= await Tutor.findById(req.params.tutorId)

    res.status(200).json({
        status: 'success',
        data: tutor
    })
});

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  };
  
  
exports.updateProfile= catchAsync(async(req, res, next)=>{
      if(req.body.password|| req.body.confirmPassword){
          return next(new AppError('you cannot update password here', 400))
      };
  
    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) req.body.photo = req.file.filename;
  
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


exports.monthlyStats= catchAsync(async(req, res, next)=>{
    const year= req.params.year * 1  //converting string to number 
    const plan = Tutor.aggregate([
        {
            $unwind: '$'
        }
    ])
})


