const express= require('express')
const userController= require('../Controllers/userController')
const authController= require('../Controllers/authController')

const router= express.Router()

router.route('/signup').post(authController.signUp)
router.route('/login').post(authController.login)
router.route('/forgotPassword').post(authController.forgotPassword)
router.route('/resetPassword/:token').post(authController.resetPassword)
router.route('/login').post(authController.login)
router.route('/update-me').post(authController.protect,userController.updateProfile)

module.exports= router