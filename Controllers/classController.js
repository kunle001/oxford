const Class= require('../Models/classModel')
const Course= require('../Models/courseModel')
const Tutor= require('../Models/tutorModel')
const AppError= require('../utils/appError')
const catchAsync= require('../utils/catchAsync')
const Email= require('../utils/email')
const User= require('../Models/userModel')

exports.createClass= catchAsync(async(req, res, next)=>{
    const course= await Course.findById(req.params.courseId);

    if(!course) return next(new AppError('no course with this ID', 404))
    if (!course.tutors.includes(req.params.tutorId)){
        return next(new AppError('This tutor is not registerd under this course', 404))
    }

    const tutorial= await Class.create({
        students: req.user.id,
        tutor: req.params.tutorId,
        course: req.params.courseId,
        price: course.price
    });
    console.log(tutorial)

    const user= tutorial.students[tutorial.students.length-1];
    const url = `${req.protocol}://${req.get(
        'host'
      )}/class/${tutorial.id}`

    await new Email(user, url).sendClass(tutorial)
    res.status(201).json({
        status: 'success',
        data: tutorial
    })
});

exports.registerClass= catchAsync(async(req, res, next)=>{
    const instance= await Class.findByIdAndUpdate(req.params.classId, {$addToSet: {students:req.user.id}},{new: true})

    //parent referencing tutor on student
    await User.findByIdAndUpdate(instance.students[instance.students.length-1],{$addToSet: {tutors:instance.tutor}, role:'student'});

    res.status(200).json({
        status: 'success',
        data: instance
    })
    
})

exports.getAll= catchAsync(async(req, res, next)=>{
    const tutorials= await Class.find();

    res.status(200).json({
        status: 'success',
        data: tutorials
    })
});

