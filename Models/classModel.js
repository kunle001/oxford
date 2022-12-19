const mongoose= require('mongoose');
const User = require('./userModel');
const Tutor= require('./tutorModel')
// const Agenda= require('agenda')


// const mongoConnectionString = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD)
// const agenda = new Agenda({ db: { address: mongoConnectionString }, collection: 'tutorials'});

// agenda.define("delete expired class", async (job) => {
//     await Tutorial.remove({ Time: { $gt: Date.now()} });
//   });

// agenda.processEvery('')

var date= new Date

var dl= new Date

const clasSchema= new mongoose.Schema({
    students: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    course:{
        type: mongoose.Schema.ObjectId,
        ref: 'Course'
    },
    tutor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tutor'
    }, 

    sheduledDay:{
        type: String,
        default: `${date.getDate()+3}/${date.getMonth()+1}/${date.getFullYear()}`
    },

    scheduledTime:{
        type: Date,
        default: date.setDate(date.getDate()+2)
    },
    deadLine:{
        type: Date,
        default: date.setDate(date.getDate()+5)
    },
    TimeBooked:{
        type: Date,
        default: Date.now()
    },
    price:{
        type: Number,
        required: [true, "a class must have a price"]
    },
    paid:{
        type: Boolean, 
        default: false
    },
    zoomLink:{
        type: String,
        // unique: true,
        trim: true
    },
    skypeLink:{
        type: String,
        // unique:true,
        trim: true
    },
    createdAt:{
        type: Date,
        default: Date.now()
    }
});

clasSchema.index({ tutor: 1, student: 1}, { unique: true });
clasSchema.index({"deadLine":1}, {expireAfterSeconds: 3600});

clasSchema.pre(/^find/,function(next){
    this.populate({
        path: 'students',
        select: 'name photo email'
    }).populate({
        path: 'course',
        select: 'name photo email'
    }).populate({
        path: 'tutor',
        select: 'name email'
    })

    next();
})

clasSchema.post('save', async function(){
    //parent referencing tutor on student
    await User.findByIdAndUpdate(this.students[0],{$addToSet: {tutors:this.tutor}, role:'student'});
    //adding booked days to tutor as soon as class is created
    await Tutor.findByIdAndUpdate(this.tutor,{$addToSet: {bookedDays:this.scheduledTime, classes:this._id}});
})

const Class= mongoose.model('Class', clasSchema);
module.exports= Class