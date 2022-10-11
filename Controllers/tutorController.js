const Tutor= require('../Models/tutorModel')
const catchAsync= require('../utils/catchAsync')

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
    if (req.file) filteredBody.photo = req.file.filename;
  
    // 3) Update user document
    const updatedTutor = await Tutor.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });
  
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedTutor
      }
    });
  
  });



