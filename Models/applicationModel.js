const mongoose= require('mongoose')
const validator= require('validator')

const applicationSchema= new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
      },
    certificates:{
        type: String, 
        required: true,
    },
    description:{
        type: String,
        required: [true, 'add a note/description to your request'],
        trim: true
    },
    subject: {
        type: String,
        required: [true, 'what subject will you love to take?']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'disapproved'],
        default: 'pending'
    }
});

const Application= mongoose.model('Application', applicationSchema)

module.exports= Application