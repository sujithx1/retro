const Referal=require('../models/referralModel')
const referalLink=require('../helpers/referal')
const User=require('../models/userModel')


const sendreferal=async(req,res)=>{
    try {

        const {email}=req.body
        console.log("email",email);
        const userId=req.session.user._id
        console.log("userID",userId);
        const userData=await User.findById({_id:userId})
        if(userData)
            {
                console.log("user find");
                referalLink.sendresetPasswordMail(email)
                const referalData= await Referal.create({
                    userId:userId,
                    email:email,
                    reffered:false
                })
                const saving=await referalData.save()
                if(saving)
                    res.status(200).json({success:true})
                else
                res.status(200).json({success:false})

            }else
            {
                console.log("userNot found");
            }
        
    } catch (error) {
        
        console.log("error from referal cotroller sendreferal",error);
    }
}
 
module.exports={
    sendreferal
}