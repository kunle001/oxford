const express= require('express')
const userController= require('../Controllers/userController')
const authController= require('../Controllers/authController')
const passport = require('passport')

const router= express.Router()


router.route('/signup-facebook').get(authController.sigupFacebook)
router.route('/facebook/callback', passport.authenticate('facebook',{
    successRedirect: '/my-profile',
    failureRedirect: '/signup'
}))


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
router.route('/my-profile').get(authController.protect, userController.profile)

// router.route('/resetPassword/:token').post(authController.resetPassword);

router.route('/').get(authController.protect,authController.RestrictTo('admin'),userController.getAllUsers)
router.route('/checkout/:price').get(authController.protect, userController.buyCredit)
module.exports= router