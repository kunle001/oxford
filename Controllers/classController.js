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

    const user= req.user;
    const url = `${req.protocol}://${req.get(
        'host'
      )}/class/${tutorial.id}`

    await new Email(user, url).sendClass(tutorial)
    res.status(201).json({
        status: 'success',
        data: tutorial
    })
});

exports.updateClass= catchAsync(async(req, res, next)=>{
    const instance= await Class.findOneAndUpdate({
        id: req.params.classId,
        tutor: req.user.id
    }, req.body, {new: true, runValidators:true})

    if(!instance) return next(new AppError('wrong course Id, or you are not authorized to perform this action',404));
    const url=`${req.protocol}://${req.get(
        'host'
      )}/class/${instance.id}`

    instance.students.forEach(async student => {
        await new Email(student, url).sendClassUpdate(instance)
    });

    res.status(200).json({
        status: 'success',
        data: instance
    })
})

exports.registerClass= catchAsync(async(req, res, next)=>{
    const instance= await Class.findByIdAndUpdate(req.params.classId, {$addToSet: {students:req.user.id}},{new: true})

    if(!instance) return next(new AppError('this class is expired',404))
    //parent referencing tutor on student
    const tutorial= await User.findByIdAndUpdate(instance.students[instance.students.length-1],
        {$addToSet: {tutors:instance.tutor}, role:'student'});

    const user= req.user;
    const url = `${req.protocol}://${req.get(
        'host'
      )}/class/${tutorial.id}`

    await new Email(user, url).sendClass(tutorial)

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

exports.monthlyStats= catchAsync(async(req, res, next)=>{
    const year= req.params.year * 1  //converting string to number 
    const plan =await Class.aggregate([
      {
        $match:{
            createdAt:{
                $gte: new Date((new Date())
                .setDate(new Date().getDate() - 1)),

                $lt: new Date()
            }
        },
        $group: {
          _id: null,
          totalSum: {$sum:"$price"}
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      message: plan
    })
});