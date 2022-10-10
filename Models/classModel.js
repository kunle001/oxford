const mongoose= require('mongoose');
const User = require('./userModel');
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
        default: dl.setMinutes(dl.getMinutes()+ 1)
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
    classLink:{
        type: String,
        default: 'not yet updated'
    }
});

clasSchema.index({ tutor: 1, student: 1}, { unique: true });
clasSchema.index({"lastModifiedDate": 1}, {expireAfterSeconds: 5});

clasSchema.post('save', async function(){
    await User.findByIdAndUpdate(this.students[0],{$addToSet: {tutors:this.tutor}},{new: true});
})

const Class= mongoose.model('Class', clasSchema);
module.exports= Class