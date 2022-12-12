const express= require('express')
const authController= require('../Controllers/authController')
const tutorController= require('../Controllers/tutorController') 
const reviewRouter= require('../Routes/reviewRoute')
const userController= require('../Controllers/userController')

const router= express.Router();

router.use('/:tutorId/reviews', reviewRouter)
router.route('/apply').post(tutorController.applyTutor)



router.route('/signup/:approvalToken').post(tutorController.checkValidToken,authController.signUpTutor);
router.route('/:tutorId').get(tutorController.findOneTutor)


router.route('/update-me').patch(
    authController.protect,
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    tutorController.updateProfile)

router.use( authController.protect,authController.RestrictTo('admin'))

router.route('/applications').get(tutorController.getApplications)
router.route('/applications/approve/:applicationId').get(tutorController.approveApplication)
router.route('/applications/disapprove/:applicationId').get(tutorController.disapproveApplication)

module.exports= router; 