const express= require('express');
const classController = require('../Controllers/classController')
const authController= require('../Controllers/authController')

const router = express.Router({ mergeParams: true });

router.use(authController.protect)
router.route('/tutor/:tutorId').get(classController.createClass)

router.route('/register-class/:classId').patch(classController.registerClass)


router.route('/').get(classController.getAll)

module.exports= router;