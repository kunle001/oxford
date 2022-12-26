const mongoose= require('mongoose')
const bcrypt = require('bcrypt')
const crypto= require('crypto')

userSchema= new mongoose.Schema({
    name: {
        type: String, 
        required: true
    }, 
    credits:{
        type: Number,
        default: 0
    },
    phone:{
        type: Number,
        required:[true, 'provide a phone number']
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
    // approvalToken:[{
    //     type:String
    // }],
    passwordResetToken: {type:String, select: false},
    passwordResetExpires: {type:Date, select:false},
    // approvalTokenExpires: {type:Date, select:false}
});

userSchema.virtual('classes', {
    ref: 'Class',
    foreignField: 'students',
    localField: '_id'
});


userSchema.pre(/^findOne/, function(next){
    this.populate({
        path: 'classes',
        select: 'name'
    }).populate({
        path:'tutors',
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

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
    };

// userSchema.methods.applicationApprovalToken= function(){
//     const approvalToken= crypto.randomBytes(32).toString('hex');

//     this.approvalToken= crypto.createHash('sha256').update(approvalToken).digest('hex')
//     this.approvalTokenExpires= Date.now() + 1440*60*1000;

//     return approvalToken
// }

const User= mongoose.model('User', userSchema)

module.exports= User
