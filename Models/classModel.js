const mongoose= require('mongoose')
// const Agenda= require('agenda')


// const mongoConnectionString = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD)
// const agenda = new Agenda({ db: { address: mongoConnectionString }, collection: 'tutorials'});

// agenda.define("delete expired class", async (job) => {
//     await Tutorial.remove({ Time: { $gt: Date.now()} });
//   });

// agenda.processEvery('')

var date= new Date
var dateOfMlSec= date.getTime()

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
        default: date.setDate(date.getDate()+2)
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
    }
});

clasSchema.index({ tutor: 1, student: 1}, { unique: true });

clasSchema.pre(/^find/, function(next){
    this.populate({
        path: 'students',
        select: 'name email'
    });

    if (this.deadLine>Date.now){
        this.delete;
        next();
    }
    next();
});

const Class= mongoose.model('Class', clasSchema)

module.exports= Class