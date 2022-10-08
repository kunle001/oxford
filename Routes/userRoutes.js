const express= require('express')
const userController= require('../Controllers/userController')
const authController= require('../Controllers/authController')

const router= express.Router()

router.route('/signup').post(authController.signUp)
router.route('/login').post(authController.login)
router.route('/forgotPassword').post(authController.forgotPassword)
router.route('/resetPassword/:token').post(authController.resetPassword)
router.route('/login').post(authController.login)
router.route('/update-me').post(
    authController.protect,
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateProfile)

router.route('/').get(userController.getAllUsers)

module.exports= router