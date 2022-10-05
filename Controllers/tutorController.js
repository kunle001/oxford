const Tutor= require('../Models/tutorModel')
const catchAsync= require('../utils/catchAsync')

exports.findOneTutor= catchAsync(async(req, res, next)=>{
    const tutor= await Tutor.findById(req.params.tutorId).populate('courses')

    res.status(200).json({
        status: 'success',
        data: tutor
    })
});

exports.updateTutor= catchAsync(async(req, res, next)=>{
    const tutor= await Tutor.findByIdAndUpdate(req.params.tutorId, req.body, {
        runValidators: true,
        new: true
    });

    res.status(200).json({
        status: 'success',
        data: tutor
    })
})

