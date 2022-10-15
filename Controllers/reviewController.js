const Review= require('../Models/reviewModel');
const User= require('../Models/userModel');
const AppError = require('../utils/appError');
const catchAsync= require('../utils/catchAsync')



exports.setTutorUserIds = (req, res, next) => {
    if (!req.body.tutor) req.body.tutor = req.params.tutorId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
  };

exports.Checked=catchAsync(async (req,res, next)=>{
    const isStudent= await User.findById(req.user.id)
    console.log(isStudent)
    if(!isStudent) return next(new AppError('You are not permitted to review, you are not a student'))
    if(!isStudent.tutors.includes(req.params.tutorId)){
        return next(new AppError('you are not a student of this tutor/no tutor with this id', 404))
    }
    next();

});


exports.createReview= catchAsync(async (req, res, next)=>{
    
        const review= await Review.create(req.body);

        if(!review){
            return next(new AppError('an error occured while creating this', 400))
        }

        res.status(201).json({
            status: 'success',
            data: review
        })
    
});


exports.getReviews= catchAsync(async(req, res, next)=>{

        const reviews= await Review.find({tutor:req.params.tutorId})

        if(!reviews){
            return(next(new AppError('no tutor with this ID', 404)))
        }

        res.status(200).json({
            length: reviews.length,
            status: 'success',
            data: reviews
        })

});

exports.updateReview=catchAsync(async(req, res, next)=>{


        const review= await Review.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidations: true})

        if(!review){
            return (next(new AppError('no review with this id', 404)))
        }

        res.status(200).json({
            status: 'success',
            data: review
        })


});

exports.deleteReview= catchAsync(async(req, res, next)=>{

        const review= await findByIdAndDelete(req.params.id)

        if(!review){
            return(next(new AppError('no review with this ID' ,404)))
        }

        res.status(200).json({
            status: 'success',
            data: null
        })

})



