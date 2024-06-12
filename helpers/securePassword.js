const bcrypt=require('bcrypt')



const Securepassword= async(password)=>{
    try {
        const passwordHash= await bcrypt.hash(password,10)
        return passwordHash
        
    } catch (error) {
        console.log('error from usercontroller securePassword',error);
    }
    
}

module.exports=
{
    Securepassword
}