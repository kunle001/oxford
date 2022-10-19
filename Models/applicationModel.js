const mongoose= require('mongoose')
const validator= require('validator')
const crypto= require('crypto')

const applicationSchema= new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please provide a name'],
        trim: true
    },
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
    },
    approvalToken:{
        type:String
    },
    approvalTokenExpires: {type:Date, select:false}
});


applicationSchema.methods.createApprovalToken= function(){
    const approvalToken= crypto.randomBytes(32).toString('hex');

    this.approvalToken= crypto.createHash('sha256').update(approvalToken).digest('hex')
    this.approvalTokenExpires= Date.now() + 1440*60*1000;

    return approvalToken
};

const Application= mongoose.model('Application', applicationSchema)

module.exports= Application