const express = require('express');
const path= require('path')
const userRouter= require('./Routes/userRoutes')

const app = express();

app.use((req, res, next)=>{
    req.requestTime= new Date().toISOString();
    next();
})

module.exports = app