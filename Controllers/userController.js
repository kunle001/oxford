const User= require('../Models/userModel')
const AppError = require('../utils/appError')
const catchAsync= require('../utils/catchAsync')
const multer= require('multer')
const sharp= require('sharp')
const Tutor = require('../Models/tutorModel')

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};


exports.updateProfile= catchAsync(async(req, res, next)=>{
    if(req.body.password|| req.body.confirmPassword){
        return next(new AppError('you cannot update password here', 400))
    };

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });

});


exports.getAllUsers= catchAsync(async(req, res, next)=>{
  const users= await User.find()

  res.status(200).json({
    status: 'success',
    data: users
  })
});

exports.profile= catchAsync(async(req, res, next)=>{
  const user= await User.findById(req.user.id);
  const tutor= await Tutor.findById(req.user.id)

  res.status(200).json({
    status: 'success',
    data: user ||tutor
  })
});

const wayforpay= require('wayforpay')

exports.buyCredit= catchAsync(async()=>{
  const clientDetails= req.users.name.split(' ')

  const client= new wayforpay({
    merchantAccount: '',
    merchantDomainName: '',
    merchantSecretKey: ''
  });

  const paymentButton= client.createPaymentButton({
    orderReference: '',
    orderDate: new Date().toISOString(),
    amount: req.params.price,
    currency: 'USD',
    productName: 'Course Credits',
    productPrice: req.params.price,
    productCount: '1',
    clientFirstName: clientDetails[0],
    clientLastName: clientDetails[1],
    clientPhone: req.user.phone,
    returnUrl: `${reeq.protocol}://${req.get('host')}/`,
    serviceUrl: ''
  });

})


