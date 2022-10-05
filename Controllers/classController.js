const Class= require('../Models/classModel')
const Course= require('../Models/courseModel')
const AppError= require('../utils/appError')
const catchAsync= require('../utils/catchAsync')
const Email= require('../utils/email')


exports.createClass= catchAsync(async(req, res, next)=>{
    const course= await Course.findOne({'tutors.id': {$elemMatch: {id: req.params.tutorId}}});

    console.log(course)

    if (!course){
        return next(new AppError('no course with this Id and tutor', 404))
    }

    const tutorial= await Class.create({
        students: req.user.id,
        tutor: req.params.tutorId,
        course: req.params.courseId,
        price: course.price
    });

    
    res.status(201).json({
        status: 'success',
        data: tutorial
    })
});

exports.getAll= catchAsync(async(req, res, next)=>{
    const tutorials= await Class.find();

    res.status(200).json({
        status: 'success',
        data: tutorials
    })
})

