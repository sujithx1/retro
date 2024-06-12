
// // checkin user login anoo enn
// const isLogin=async(req,res,next)=>{
//     try {
//         if (req.session.admin)
//         {
//             next()

//         }
//         else{
//             res.redirect('/admin/signin')
//         }

        
//     } catch (error) {
//         console.log('error from middileware isLogin',error);
        
//     }
// }
// // 
// const isLogout=async(req,res,next)=>
// {
//     try {
//        if( req.session.admin)
//        {
//         res.redirect('/admin/dashboard')
//        }
//       else{
//         next()
//       }
        

        
//     } catch (error) {
//         console.log(error.message);
//     }
// }
// module.exports={
//     isLogin,
//     isLogout

// }
const isLogin = async (req, res, next) => {
    try {
        if (req.session.admin) {
            console.log(req.session.admin);
            
            next();
        } else {
            
            res.redirect('/admin');
           
        }
    } catch (error) {
        console.log('error from middleware isLogin', error);
        res.status(500).send('An error occurred');
    }
};
//  ;
const isLogout = async (req, res, next) => {
    try { 
        
        if (req.session.admin) {
            
            res.redirect('/admin/home')  
           
            
        } else {
            
            next();

        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('An error occurred');
    }
};



module.exports = {
    isLogin,
    isLogout
};
