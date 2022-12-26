const mongoose= require('mongoose')
const crypto= require('crypto')

const applicationSchema= new mongoose.Schema({
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    CV:{
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
    createdAt: {
        type: Date,
        default: Date.now()
    },
    approvalToken:{
        type:String
    },
    approvalTokenExpires: {type:Date, select:false}
});


applicationSchema.pre(/^find/,function(next){
    this.populate({
        path:'user',
        select: 'name email photo'
    });
    next()
})

applicationSchema.methods.createApprovalToken= function(){
    const approvalToken= crypto.randomBytes(32).toString('hex');

    this.approvalToken= crypto.createHash('sha256').update(approvalToken).digest('hex')
    this.approvalTokenExpires= Date.now() + 1440*60*1000;

    return approvalToken
};

const Application= mongoose.model('Application', applicationSchema)

module.exports= Application