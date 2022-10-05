const mongoose= require('mongoose')
const validator= require('validator')
const bcrypt= require('bcrypt')
const crypto= require('crypto')


tutorSchema= new mongoose.Schema({
    name:{
        type: String, 
        required: [true, 'provide your name']
    }, 
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
      },
    photo: {
        type: String,
        default: 'default.jpg'
      },
    instagram:{
        type: String, 
        required: [true, 'provide your instagram']
    }, 
    twitter:{
        type: String, 
        required: [true, 'provide your twitter']
    }, 
    facebook: {
        type: String, 
        required: [true, 'provide your facbook account']
    }, 
    language: [{
        type: String, 
        required: [true, 'what language do you tutor']
    }], 
    experience: {
        type: Number, 
        required: [true, 'how many years of experience do you have ']
    }, 
    ratingsAverage: {
        type: Number,
        default: 0,
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10 // 4.666666, 46.6666, 47, 4.7
      },
    ratingsQuantity: {
        type: Number,
        default: 0
      },
    bio:{
        type: String, 
        required: [true, 'plesae provide a bio statement'],
        trim: true
    },
    courses: [{
        type: mongoose.Schema.ObjectId, 
        ref: 'courses'
    }],
    role: String,
    password: {
        type: String,
        required: true
    }, 
    confirmPassword: {
        type: String, 
        required: true, 
        validate:{
            validator: function(el){
                return el=== this.password
            }, 
            message: "confirm your password again"
        }
    },
    bookedDays:[{
        type: Date
    }],
    passwordResetToken: {type:String, select: false},
    passwordResetExpires: {type:Date, select:false}
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });



// tutorSchema.pre('find', function(next){
//     this.bookedDays[0]= Class.date
// })

tutorSchema.pre('save', async function(next){
    this.role= 'tutor'
    if(!this.isModified('password')) return next();

    this.password= await bcrypt.hash(this.password, 12);

    this.confirmPassword= undefined;
    next();    
});

tutorSchema.methods.correctPassword =  async function(
    candidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
  };
  
tutorSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
        );

        return JWTTimestamp < changedTimestamp;
    }

    // False means NOT changed
    return false;
    };

    tutorSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
    };

const Tutor= mongoose.model('Tutor', tutorSchema)

module.exports= Tutor
