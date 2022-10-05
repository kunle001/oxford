const express= require('express')
const authController= require('../Controllers/authController')
const tutorController= require('../Controllers/tutorController') 

const router= express.Router();

router.route('/signup').post(authController.signUpTutor);
router.route('/:tutorId').get(tutorController.findOneTutor)
router.route('/update/:tutorId').patch(tutorController.updateTutor)



module.exports= router; 