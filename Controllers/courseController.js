const Course= require('../Models/courseModel')
const catchAsync= require('../utils/catchAsync')

exports.createCourse= catchAsync(async(req, res, next)=>{
    
    const course= await Course.create(req.body)

    res.status(201).json({
        status: 'success',
        data: course
    })
});

exports.getAllCourse= catchAsync(async(req, res, next)=>{
    const courses= await Course.find()

    res.status(200).json({
        status: 'success',
        data: courses
    });
});

exports.getOneCourse= catchAsync(async(req, res, next)=>{
    const course= await Course.findById(req.params.courseId)

    res.status(200).json({
        status: 'success',
        data: course
    })
});

