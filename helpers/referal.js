const nodemailer=require('nodemailer')
require('dotenv').config()



const sendresetPasswordMail=(email)=>{
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
            subject:'Retro Referal',
            html:'<p> Hai '+email+'Please Click the  link <a href='`${process.env.CLIENT_URL}/signup`>'and Register </a></p>'
        
        
        }
        transporter.sendMail(mailOPtion,(err,info)=>{
            if(err)
            {
                    console.log('error from helper > referal > sendmail',err.message)
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
            sendresetPasswordMail
        }