const express= require('express')
const authController= require('../Controllers/authController')

const router= express.Router();

router.route('/signup').post(authController.signUpTutor)


module.exports= router; 