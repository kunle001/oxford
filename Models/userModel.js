const mongoose= require('mongoose')
const bcrypt = require('bcrypt')
const crypto= require('crypto')

userSchema= new mongoose.Schema({
    name: {
        type: String, 
        required: true
    }, 
    nationality: String,
    email:{
        type: String, 
        required: [true, 'provide a valid email'],
        unique: [true, 'there is a registered user with this mail'],
        lowercase:true
    } ,
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String, 
        enum: ['user', 'student','tutor', 'admin'], 
        default: 'user'
    },
    password: {
        type: String,
        required: true,
        select: false
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
    tutors: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Tutor'
    }],
    passwordResetToken: {type:String, select: false},
    passwordResetExpires: {type:Date, select:false}
});

userSchema.virtual('classes', {
    ref: 'Class',
    foreignField: 'students',
    localField: '_id'
});


userSchema.pre(/^find/, function(next){
    this.populate({
        path: 'classes',
        select: 'name'
    })
    next();
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    this.password= await bcrypt.hash(this.password, 12);

    this.confirmPassword= undefined;
    next();    
});


userSchema.methods.correctPassword =  async function(
    candidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
  };
  
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
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

    userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
    };

const User= mongoose.model('User', userSchema)

module.exports= User
