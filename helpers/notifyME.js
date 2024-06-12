const nodemailer = require('nodemailer')
require('dotenv').config()


// const content="Hi there Thank you for the vist  Your Product will safe "

const sendMsg=(email)=>{
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
    subject:'Product Notifying ',
    text:` Thank you for  visiting website Your product is safe `


}
 transporter.sendMail(mailOPtion,(err,info)=>{
    if(err)
    {
            console.log('error from helper >notify > sendmsg',err.message)
            reject(err)
    }else

    {
        console.log('Email sent :'+ info.response);
        resolve(info)
    }
 })

})
}
module.exports=sendMsg