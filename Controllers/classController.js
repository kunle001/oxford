const Class= require('../Models/classModel')
const Course= require('../Models/courseModel')
const Tutor= require('../Models/tutorModel')
const AppError= require('../utils/appError')
const catchAsync= require('../utils/catchAsync')
const Email= require('../utils/email')


exports.createClass= catchAsync(async(req, res, next)=>{
    const course= await Course.findById(req.params.courseId);

    if (!course.tutors.includes(req.params.tutorId)){
        return next(new AppError('no course with this Id and tutor', 404))
    }
    console.log(req.user.id)
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

exports.registerClass= catchAsync(async(req, res, next)=>{
    console.log(req.user.id)
    const instance= await Class.findByIdAndUpdate(req.params.classId, {$addToSet: {students:req.user.id}},{new: true})

    console.log(instance)

    res.status(200).json({
        status: 'success',
        data: instance
    })
    
})

exports.getAll= catchAsync(async(req, res, next)=>{
    const tutorials= await Class.find().populate('students');

    res.status(200).json({
        status: 'success',
        data: tutorials
    })
})

