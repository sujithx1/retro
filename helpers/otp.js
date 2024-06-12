
const gerate_otp=require('otp-generator')
const nodemailer=require('nodemailer')
// const { info } = require('console')
require('dotenv').config()


const generate=()=>{
    const otp=gerate_otp.generate(4,{
        length:4,
        digits:true,
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false
    })
    return otp
}

const sendOtp=(email,otp)=>{
    return new Promise((resolve,reject)=>{
        const transporter=nodemailer.createTransport({
            service:'gmail',
            auth:
            {
                user:process.env.Email,
                pass:process.env.Password
            }
            
        })

const mailOPtion={
    from:process.env.Email,
    to:email,
    subject:'Otp for Verification',
    text:` ${otp}  this is your Otp for verification`


}
 transporter.sendMail(mailOPtion,(err,info)=>{
    if(err)
    {
            console.log('error from helper > otp > sendOtp',err.message)
            reject(err)
    }else

    {
        console.log('Email sent :'+ info.response);
        resolve(info)
    }
 })

})
}

module.exports={
    generate,
    sendOtp
}