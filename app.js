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

//make our facebook strategy

// passport.use(new facebookStrategy({

//     clientID: "1153882575565229",
//     clientSecret: "eb0d0c3f7f8db3d89fe28f7a58455979",
//     callbackURL: "http://127.0.0.1:5000/api/v1/course",
//     profileFields: ['id', 'displayName', 'name', 'gender',"picture.type(large)", "email" ]
// },//facebook will send back the token and profile 
// function(token, refreshToken, profile, done){
//     console.log(profile)
//     return done(null,profile)

// }));

// passport.serializeUser(function(user, done){
//     done(null, user)
// })

// passport.deserializeUser(function(user, done){
//     done(null,user)
// })

app.use((req, res, next)=>{
    req.requestTime= new Date().toISOString();
    next();
});
app.use(bodyParser.json());
//SETTING UP PUG
app.use(express.static(path.join(__dirname, 'public')));


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