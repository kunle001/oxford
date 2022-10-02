const dotenv= require('dotenv')
const mongoose= require('mongoose')
const app= require('./app')


dotenv.config({ path: './config.env' });


const DB= process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD)

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=> console.log('DB connected succesfully'));

const server= app.listen(5000, ()=>{
    console.log(process.env.MODE)
    console.log('Runnning on port 5000...')
})