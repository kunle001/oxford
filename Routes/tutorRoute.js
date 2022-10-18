const express= require('express')
const authController= require('../Controllers/authController')
const tutorController= require('../Controllers/tutorController') 
const reviewRouter= require('../Routes/reviewRoute')
const userController= require('../Controllers/userController')

const router= express.Router();
router.use('/:tutorId/reviews', reviewRouter)

router.route('/apply').post(tutorController.applyTutor)
router.route('/applications').get(
    authController.protect,
    authController.RestrictTo('admin'),
    tutorController.getApplications)

router.route('/signup').post(authController.signUpTutor);
router.route('/:tutorId').get(tutorController.findOneTutor)

router.route('/update-me').patch(
    authController.protect,
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    tutorController.updateProfile)



module.exports= router; 