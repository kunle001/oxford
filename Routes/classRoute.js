const express= require('express');
const classController = require('../Controllers/classController')
const authController= require('../Controllers/authController')

const router = express.Router({ mergeParams: true });


router.route('/tutor/:tutorId').get(
    authController.protect,
    classController.createClass)

router.route('/').get(classController.getAll)

module.exports= router;