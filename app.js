const express = require('express');
const bodyParser= require('body-parser')
const userRouter= require('./Routes/userRoutes')
const cookieParser= require('cookie-parser')
const path= require('path')
const tutorRouter= require('./Routes/tutorRoute')
const classRouter= require('./Routes/classRoute')
const courseRouter= require('./Routes/courseRoute')
const reviewRouter= require('./Routes/reviewRoute')

//ERROR HANDLER
const AppError= require('./utils/appError')
const globalError= require('./Controllers/errorController')

const app = express();
const passport= require('passport')
const session= require('express-session')


app.use(session({secret: "thisissecretkey"}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());


app.use((req, res, next)=>{
    req.requestTime= new Date().toISOString();
    next();
});
app.use(bodyParser.json());
//SETTING UP PUG

app.engine('pug', require('pug').__express)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'))

//Serving static files
app.use(express.static(path.join(__dirname, 'html')));


app.use('/api/v1/users', userRouter)
app.use('/api/v1/tutors', tutorRouter)
app.use('/api/v1/class', classRouter)
app.use('/api/v1/course', courseRouter);
app.use('api/v1/reviews', reviewRouter)

app.all('*',(req, res, next)=>{
    next (new AppError(`Page ${req.originalUrl} is not found`, 404 ))
})

app.use(globalError)

module.exports = app