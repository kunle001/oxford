const express= require('express')
const courseController= require('../Controllers/courseController')
const classRouter= require('../Routes/classRoute')

const router= express.Router();

router.use('/:courseId/class', classRouter)


router.route('/').post(courseController.createCourse)
                 .get(courseController.getAllCourse)
                 
router.route('/:courseId').get(courseController.getOneCourse)

router.route('/agg/stats').get(courseController.getCourseStats)

module.exports= router;