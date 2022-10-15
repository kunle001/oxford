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

exports.getCourseStats= catchAsync(async(req, res, next)=>{
    const stats= await Course.aggregate([
        {
            $match: { ratingsAverage:{$gte:0}}
        },
        {
            $group: {
                _id: {$toUpper: '$level'},
                numCourse: {$sum: 1},
                numRatings: {$sum: '$ratingsQuantity'},
                avgRating: {$avg: '$ratingsAverage'},
                avgPrice: {$avg: '$price'},
                minPrice: {$min: '$price'},
                maxPrice: {$max: '$price'}

            }
        },
        {
            $sort: {avgPrice: 1}
        },
        // {
        //     $match: {_id: {$ne: 'BEGINER'}}
        // }
    ]);
    res.status(200).json({
        status: 'success',
        data: stats
    })
});
