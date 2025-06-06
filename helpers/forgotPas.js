const nodemailer=require('nodemailer')
require('dotenv').config()



const sendresetPasswordMail=(username,email,token)=>{
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
            subject:'reset password',
            html:`<p> Hai ${username}Please Click the  link <a href=${process.env.CLIENT_URL}/reset-password?token=${token}>and reset your password</a></p>`
        
        
        }
        transporter.sendMail(mailOPtion,(err,info)=>{
            if(err)
            {
                    console.log('error from helper > forgot > sendmail',err.message)
                    reject(err)
            }else
        
            {
                console.log('Email sent :'+ info.response);
                resolve(info)
            }
         })
        
        })
        }
      
// const sendresetPasswordMail=async (username,email,token)=>{
//     try {
//        const transporter= nodemailer.createTransport({
//             host:'smtp',
//             port:587,
//             secure:false,
//              require:true,
//              auth:{
//                 user:process.env.Email,
//                 pass:process.env.Password
//              }
//         })
//         const mailOPtion={
//             from:process.env.Email,
//             to:email,
//             subject:'for Reset Password',
//             html:'<p> Hai '+username+'Please Click the  link <a href="http://localhost:3000/reset-password?token='+token+'">and reset your password</a></p>'
//         }
//         transporter.sendMail(mailOPtion,function(error,info){
//             if(error)
//             {
//                 console.log(error);

//             }
//             else{
//                 console.log('mail has been sent :' ,info.response);
//             }
//         })
        
//     } catch (error) {
        
//         console.log('error from usercontroller ');
//     }
// }
module.exports={
    sendresetPasswordMail
}