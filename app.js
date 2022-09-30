const express = require('express');
const path= require('path')
const bodyParser= require('body-parser')
const userRouter= require('./Routes/userRoutes')

const app = express();

app.use((req, res, next)=>{
    req.requestTime= new Date().toISOString();
    next();
});
app.use(bodyParser.json());

app.use('/api/v1/users', userRouter)

module.exports = app