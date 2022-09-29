const express= require('express')
const userController= require('../Controllers/userController')

const router= express.Router()

router.route('/signup').post(userController.signUp)

module.exports= router