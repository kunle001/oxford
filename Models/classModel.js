const mongoose= require('mongoose')
// const Agenda= require('agenda')


// const mongoConnectionString = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD)
// const agenda = new Agenda({ db: { address: mongoConnectionString }, collection: 'tutorials'});

// agenda.define("delete expired class", async (job) => {
//     await Tutorial.remove({ Time: { $gt: Date.now()} });
//   });

// agenda.processEvery('')

const date= new Date()

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

    Day:{
        type: String,
        default: `${date.getDate()+3}/${date.getMonth()+1}/${date.getFullYear()}`
    },
    TimeBooked:{
        type: Date,
        default: date.getTime()
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

clasSchema.index({ tutor: 1, student: 1 }, { unique: true });


const Class= mongoose.model('Class', clasSchema)

module.exports= Class