const express = require('express');
const path= require('path')
const bodyParser= require('body-parser')
const userRouter= require('./Routes/userRoutes')

//ERROR HANDLER
const AppError= require('./utils/appError')
const globalError= require('./Controllers/errorController')

const app = express();


app.use((req, res, next)=>{
    req.requestTime= new Date().toISOString();
    next();
});
app.use(bodyParser.json());

app.use('/api/v1/users', userRouter)

app.all('*',(req, res, next)=>{
    next (new AppError(`Page ${req.origianlUrl} is not found`, 404))
})

app.use(globalError)

module.exports = app