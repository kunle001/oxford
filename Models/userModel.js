const mongoose= require('mongoose')
const bcrypt = require('bcrypt')


userSchema= new mongoose.Schema({
    name: {
        type: String, 
        required: true
    }, 
    nationality: String,
    email:{
        type: String, 
        required: [true, 'provide a valid email']
    } ,
    role: {
        type: String, 
        enum: ['user', 'student','tutor', 'admin'], 
        default: 'user'
    },
    courses: [{
        type: String
    }], 
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
    passwordResetToken: {type:String, select: false},
    passwordResetExpires: {type:Date, select:false}
});

userSchema.pre('save', function(next){
    if(!this.isModified('password')) return next();

    this.password= bcrypt.hash(this.password, 12);

    this.confirmPassword= undefined;
    next();    
})

const User= mongoose.model('User', userSchema)

module.exports= User
