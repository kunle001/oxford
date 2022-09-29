const mongoose= require('mongoose')

userschema= new mongoose.Schema({
    name: {
        type: String, 
        required: true
    }, 
    nationality: String, 
    courses: [{
        type: String
    }]
});

const User= mongoose.model('User', userschema)

module.exports= User
