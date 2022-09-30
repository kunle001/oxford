const User= require('../Models/userModel')

exports.signUp= async(req, res, next)=>{
    console.log(req.body)
    try{
        const user= await User.create(req.body)
        res.status(201).json({
            data: user
        })
    }catch(err){
        res.status(400).json({
            errorMessage: err
        })

    }
}