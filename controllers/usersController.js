
const User=require('../models/userModel')
const product=require('../models/productModel')
const category=require('../models/categoryModel')
const bcrypt=require('bcrypt')
const otp=require('../helpers/otp')
const securePassword=require('../helpers/securePassword')
const forgetPassword=require('../helpers/forgotPas')

const randomstring=require('randomstring')
const Notifying=require('../helpers/notifyME')

// const googleLink=require('../helpers/oAuth')
const Address=require('../models/addressModel')

const Cart= require('../models/cartModel')
const Order=require('../models/orderModule')
const Product= require('../models/productModel')
const Category=require('../models/categoryModel')
const  Referal=require('../models/referralModel')
const Coupon=require('../models/couponModel')
// const Order=require('../models/orderModule')
const Rating=require('../models/RatingModel')
const mongoose=require('mongoose')

const Transaction=require('../models/transactionModel')




// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

// passport.use(new GoogleStrategy({
//     clientID: "30937109325-vlhcjg3mp1d9v3mf887be0ljur03ik40.apps.googleusercontent.com",
//     clientSecret: "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",
//     callbackURL: "http://localhost:3000/auth/google/callback"
// },
// async function(accessToken, refreshToken, profile, done) {
//     try {
//         let user = await User.findOne({ googleId: profile.id }).exec();
        
//         if (!user) {
//             user = await User.create({
//                 googleId: profile.id,
//                 email: profile.emails[0].value, // Assuming email is provided from Google profile
//                 username: profile.displayName, // Assuming username is provided from Google profile
//                 isBlocked: false, // Assuming isBlocked is optional and default value is false
//                 password: "", // Assuming password is optional and empty string
//                 mobile: "", // Assuming mobile is optional and empty string
                
//             });
//         }
        
//         return done(null, user);
//     } catch (err) {
//         return done(err);   
//     }
// }));


// const googleAuth=  passport.authenticate('google', { scope: ['profile', 'email'] })
// // googleAuth: passport.authenticate('google', { scope: ['profile', 'email'] }),
// const googleCallback= passport.authenticate('google', { failureRedirect: '/login' })



const loadSuccesGoogle=async(req,res)=>{
    try {
        if(!req.user)
        {
           
            
            res.redirect('/failure')
            console.log(req.user);
        }
        else

        {
            req.session.user={
                _id:req.user._id
            }
            
            console.log("success",req.user._id);
            // const message = `Success: ${req.user.email}`;
            res.status(200).redirect('/home')

        }
       
        
    } catch (error) {
        
        console.log('error from usercontroller loadSuccesGoogle',error);
    }
}

const loadFailurGoogle=async(req,res)=>{
    try {
        console.log("failed");
        res.status(404).redirect('/login')
        
    } catch (error) {
        
        console.log('error from userController loadFailurGoogle',error);
    }
}

// loading home funmnction
const loadlandingPage=async(req,res)=>
{
    try {
    
    
                

        const productList=await Product.find().populate('category')

        // const sortedProducts = productList.sort((a, b) => a.date + b.date);


        res.render('users/land',{products:productList})
        console.log('users home rendered');
        
    } catch (error) {
        console.log('error from userController loadhome',error);
        
    }
}



const loadLogin= async(req,res)=>{
 
    try {
        res.render('users/login')
        console.log('login page renderde ');
        
    } catch (error) {
        console.log('eror from usercontrol userLogin SignUp',error);
        
    }
}
// loading signUp function

const loadSignup= async(req,res)=>{
    try {
        res.render('users/signup')
        console.log('signup page is renderd');
        
    } catch (error) {
        console.log('error from user controller load signup',error);
        
    }
}
// inserting new users function
const insertUser=async (req,res)=>{
    console.log('insertUser ');
    try {
        // checking register EMail And Mobiole number is Already Exist or Not 

        // if already exist error show sign upm page 
        //  finding or Checking  in our DB User collection 
        console.log('insertUser ');

        const existEmail=await User.exists({
            email:req.body.email
        })
        const existMobile=await User.exists({
            mobile:req.body.mobile
        })
        //  if true  sending error and 
        if(existEmail && existMobile)

        {
            res.render('users/signup',{msg:'Email and Mobile Number already Exist'})
            console.log("'Email and Mobile Number already Exist'");
        }else if(existEmail)
        {
            res.render('users/signup',
        {msg:'Email is Already Exist'})
        console.log('Email is Already Exist');
        }else if(existMobile)
        {
            res.render('users/signup',
        {msg:'Mobile Number is Alredy Exist'})
        console.log("Mobile Number is Alredy Exist");
        }
      
        //  else case creating otp  
        else{

            const otpCode=otp.generate()

            // session le store cheyunnu temparory ayite  we want check otp if otp verification completed  store in Db
            req.session.tempUser=req.body
            //  storing sessio  requiore cheytha mail 
            req.session.email=req.body.email
            // session storing genert cheytha otp
            req.session.otp=otpCode
            // session otptExoire enna avriable store cheyunnu  current date and time + 60 second vare 
            req.session.otpExpire=Date.now()+60*1000
            console.log('otp',req.session.otp);


                await otp.sendOtp(req.session.email , otpCode)
                .then((result)=>{
                    res.redirect('/verification')
                console.log(result);


              })
              .catch((err)=>{
                res.render('users/signup',
            {
                msg:'Error in otp or server not responding '
                
            })
            console.log("Error in otp or server not responding  ");
            
            console.log(err);
              })                
                

            

        }
        


        


        
    } catch (error) {
        console.log('error from userConmtroller insert user',error);
        
    }
}
// otp page loading
const loadOTP = async(req,res)=>{
   try {
    console.log('load otp renderde');
    res.render('users/verification')
    
   } catch (error) {
    console.log('error from otp',error);    
   }
}
// verifying otp function
const verifyOtp=async(req,res)=>{

    try {
        // otp verify cheyyun 
        // body the collect cheyyunnnu

       const obj=req.body
    //    
       const jsonString = JSON.stringify(obj)
    //    {"verify":["9647",""]} egane oru obj ayyirrikkum kittuaa
       console.log(jsonString);
       const data = req.body;
    //   const verifyArray = data.verify; // Get the "verify" array from req.body
    //    // Output: "123" egane aaakkan
    //   const firstElement = verifyArray[0]; // Access the first element of the "verify" array

    //    console.log(firstElement); // Output: "123"
    //    const entrOtp=firstElement
    if (data.verify && typeof data.verify === 'string') {
        const otp = data.verify; // Extract the OTP
        console.log(otp); // Output the OTP
        const entrOtp=otp

    
 
    
       const sessionOtp=req.session.otp
       const expOtp=req.session.otpExpire
       console.log('enterd otp'+entrOtp);
       console.log('session otp'+sessionOtp);
       console.log('expire in sessoin'+expOtp);

       if(entrOtp===sessionOtp && Date.now() < expOtp)
       {
        console.log('opt verification finished');
        req.session.otp=null
        const userData=req.session.tempUser
        const Spassword= await securePassword.Securepassword(userData.password)

            const user= await User.create({
                username: userData.username,
                email: userData.email,
                mobile: userData.mobile,
                password: Spassword,
                isBlocked: false,

            })
            const userInfo =await user.save()
            const referalData=await Referal.findOne({email:userData.email})
            if( referalData)
                {
                    const referralUpdate = await Referal.findOneAndUpdate(
                        { email: userData.email },
                        { $set: { reffered: true } },
                        { new: true } // This option returns the updated document
                    );
                    if(referralUpdate)
                        {
                            const userId=referalData.userId
                            console.log("userId",userId);
                            const wallet=100
                            const orderData = await Order.findOneAndUpdate(
                                { userId: userId },
                                { $inc: { Wallet: wallet } },
                                { new: true }
                            );
                                if(orderData)
                                console.log("saved");
                            else
                            console.log("not saved");
                        }

                        }
                   
            if(userInfo)
            {
                res.redirect('/login')
                console.log('saved user in mongo db');
            }


       }else
       {
        res.render('users/verification',
    {msg:'Incorrect OTP or Expired OTP. Please try again'})
       }

       


    }
        
    } catch (error) {
        console.log('error from usercontroll > verifyOtp',error);
        
    }
}

// resending otp  function
const resendOtp=async(req,res)=>{
    try {
        
        console.log('resend otp rendering');
        if(req.session.otp || req.session.otpExpire < Date.now() )
        {
        // generat new otp  /helper/otp
            const otpCode=otp.generate()
            // sesssion lott vakkunnu
            req.session.otp=otpCode
            // session le time set akkumnnu
            req.session.otpExpire=Date.now()+60*1000

            // admin te gmail ninnum user de mail ootte otp send cheyynnu
            await otp.sendOtp(req.session.email , otpCode)
                .then((result)=>{
                    // send aayal redirect cheyyuu u
                    res.redirect('/verification')
                console.log(result);


              })
            //    illel error msg kaanikkunnu
              .catch((err)=>{
                res.render('users/signup',
            {
                msg:'Error in otp  '
            })
            console.log(err);
              })             
            

        }
        
    } catch (error) {
        console.log('error from userController resend otp',error);
        
    }
}


// verify LOgin
const verifyLogin=async (req,res)=>{
    try {


        const email=req.body.email
        const password=req.body.password

        const userData=await User.findOne({email:email})
        if(userData)
        {
            if(userData.isBlocked)
            {
                res.render('users/login',{msg:'user is blocked'})
            }else{
            console.log(userData.email);
            console.log("verify login");
            // hash cheythu db le password  check cheynnu
            const passwordMatch=await bcrypt.compare(password,userData.password)
            
            if(passwordMatch)
            {
                    req.session.user={
                        _id:userData._id,   
                        email:email,
                        isBlocked:false,
                        username:userData.username
                    }
                res.redirect('/home')
            }else

            {
                res.render('users/login',{msg:'Password is not matching'})
            }
        }
        }else

        {
            res.render('users/login',{msg:'your Email and password is wrong'})
        }
    
        
    } catch (error) {
        
        console.log('error from userController verify Login',error);
    }
}

const  loadhome = async(req,res)=>{
    try {
   
      
let name=""

if(req.session.user)
    {
        name=req.session.user.username

    }



// Initialize variables
let search = { delete: false }; // Ensure only non-deleted products are considered
let sort = {};
// le/t page = 1;
// const limit = 3;
let cat = "";
let productList = [];

// Handle sorting parameters
if (req.query.price) {
let sortValue = parseInt(req.query.price);
if (sortValue === 1 || sortValue === -1) {
sort.promo_price = sortValue;
} else {
console.log("Invalid price sort value");
}
}

if (req.query.name) {
let sortValue = parseInt(req.query.name);
if (sortValue === 1 || sortValue === -1) {
sort.name = sortValue;
} else {
console.log("Invalid name sort value");
}
}

// Handle search parameter
if (req.query.search) {
let searchValue = req.query.search;
search.name = { $regex: searchValue, $options: "i" };
}

// // Handle pagination parameter
// if (req.query.page) {
// page = parseInt(req.query.page);
// }

// Fetch categories
const categories = await Category.find({});

// Handle category filter
if (req.query.category) {
cat = req.query.category;
console.log("Category: ", cat);

const category = await Category.findOne({ name: cat });
if (category) {
search.category = category._id;
console.log("search category ",search.category);
} else {
console.log("Category not found");
}
}

// Fetch products based on search, sort, and pagination
productList = await Product.find(search)
.populate('category')
.populate({ path: 'offer' })
.sort(sort)
// .limit(limit)
// .skip((page - 1) * limit)
.exec();

// Count all products matching the search criteria
// const count = await Product.countDocuments(search);

// console.log(count);

// Render the shop view with products and categories
res.render('users/home', {
products: productList,
categories,
selectedCategory: cat,
// currentpage: page,
// nextpage: page + 1,
// totalpage: Math.ceil(count / limit),
search: req.query.search,
sort,
// count,
name,
category:categories,
reqQuery: req.query
});
      
        
    } catch (error) {
        
        console.log("error from userController load Home",error);
    }
}
// loggOut function
const LoggedOut=async(req,res)=>{
    try {
        //  session le ellam destroy cheynnu
        req.session.destroy()
        res.redirect('/home')
        
    } catch (error) {
        console.log('error from userController logout',error);
    }
}
// forgetPassword loading
const Loadforgot=async(req,res)=>{
    try {
        res.render('users/forgotPass')
        
    } catch (error) {
        console.log('error from use Controll Load Forgot',error);
    }
}
// forget passwword function
const forget_password=async(req,res)=>{
    try {
        // mail collect cheyunnu
        const email=req.body.email
        // mail verify cheyunnu 
        const userData=await User.findOne({email:email})
        console.log('forgetPassword Page renderd');
        if(userData)
        {

            // true aneel
            //  oru random string generat aakkunnu
            
            const randomnString=randomstring.generate()

           const data=await User.updateOne({email:email},{$set:{token:randomnString}})
        //    mail oott send cheyyunnu  /helper / forgot 
        if(data)
        {

            forgetPassword.sendresetPasswordMail(userData.username,userData.email,randomnString)
           res.render('users/forgotPass',{msg:'check your Mail inbox and reset your password'})
        }
           

        }
        else
        {
            res.render('users/forgotPass',{msg:'your Email is not valid'})
        }
        
    } catch (error) {
        console.log('error from userController forget-password',error);
    }
}
// reseting password load page
const LoadReset_password=async (req,res)=>{
    try {
        res.render('users/resetPass')
        
    } catch (error) {
        console.log('error from userController Loadreset_password',error);
    }
}
// reseting password  function
const reset_password=async(req,res)=>{
    try {
        
        console.log('resetPage renderd');
        // reseting Password token finding 
        const token=req.query.token
        //  aa token token same checking
        const tokenData=await User.findOne({token:token})
        if(tokenData)
        {
            // true ayaal body the password  collect cheyunnu
            const password=req.body.password
            console.log(password);
            // hash cheyunnu
            const Spassword=await securePassword.Securepassword(password)
            //  password set cheyyunn
           const userData=await User.findByIdAndUpdate({_id:tokenData._id},{$set:{password:Spassword,token:""}},{new:true})
        //    res.render('users/login',{msg:'Your password has been changed',data:userData})
        res.redirect('/login')
        //    
           console.log(userData.password);
           console.log(tokenData.password);


        }

        // }else
        // {
        //     res.render('users/forgotPass',{msg:'your link expire'})
        // }
       
        
    } catch (error) {
        console.log('error from userController rsetPassword',error);
    }
}



// shope section
const LoadShop=async(req,res)=>{
    try {

let name=""

        if(req.session.user)
            {
                name=req.session.user.username

            }

        
    
// Initialize variables
let search = { delete: false }; // Ensure only non-deleted products are considered
let sort = {};
let page = 1;
const limit = 3;
let cat = "";
let productList = [];

// Handle sorting parameters
if (req.query.price) {
    let sortValue = parseInt(req.query.price);
    if (sortValue === 1 || sortValue === -1) {
        sort.promo_price = sortValue;
    } else {
        console.log("Invalid price sort value");
    }
}

if (req.query.name) {
    let sortValue = parseInt(req.query.name);
    if (sortValue === 1 || sortValue === -1) {
        sort.name = sortValue;
    } else {
        console.log("Invalid name sort value");
    }
}

// Handle search parameter
if (req.query.search) {
    let searchValue = req.query.search;
    search.name = { $regex: searchValue, $options: "i" };
}

// Handle pagination parameter
if (req.query.page) {
    page = parseInt(req.query.page);
}

// Fetch categories
const categories = await Category.find({});

// Handle category filter
if (req.query.category) {
    cat = req.query.category;
    console.log("Category: ", cat);

    const category = await Category.findOne({ name: cat });
    if (category) {
        search.category = category._id;
        console.log("search category ",search.category);
    } else {
        console.log("Category not found");
    }
}

// Fetch products based on search, sort, and pagination
productList = await Product.find(search)
    .populate('category')
    .populate({ path: 'offer' })
    .sort(sort)
    .limit(limit)
    .skip((page - 1) * limit)
    .exec();

// Count all products matching the search criteria
const count = await Product.countDocuments(search);

console.log(count);
     
// Render the shop view with products and categories
res.render('users/shop', {
    products: productList,
    categories,
    selectedCategory: cat,
    currentpage: page,
    nextpage: page + 1,
    totalpage: Math.ceil(count / limit),
    search: req.query.search,
    sort,
    count,
    name,
    category:categories,
    reqQuery: req.query
});
        
    // // Initialize variables
    // let search = "";
    // let sort = {};
    // let page = 1;
    // const limit = 3;
    // let cat = "";
    // let productList;

    // // Handle sorting parameters
    // if (req.query.price) {
    //     let sortValue = parseInt(req.query.price);
    //     if (sortValue === 1 || sortValue === -1) {
    //         sort = { promo_price: sortValue };
    //     } else {
    //         console.log("Invalid price sort value");
    //     }
    // }

    // if (req.query.name) {
    //     let sortValue = parseInt(req.query.name);
    //     if (sortValue === 1 || sortValue === -1) {
    //         sort = { name: sortValue };
    //     } else {
    //         console.log("Invalid name sort value");
    //     }
    // }

    // // Handle search parameter
    // if (req.query.search) {
    //     search = req.query.search;
    // }

    // // Handle pagination parameter
    // if (req.query.page) {
    //     page = parseInt(req.query.page);
    // }

    // // Fetch categories
    // const categories = await Category.find({});

    // // Handle category filter
    // if (req.query.category) {
    //     cat = req.query.category;
    //     console.log("Category: ", cat);

    //     const category = await Category.findOne({ name: cat });

    //     if (category) {
    //         productList = await Product.find({
    //             category: category._id,
    //             $or: [{ name: { $regex: search, $options: "i" } }]
    //         })
    //         .populate('category')
    //         .populate({ path: 'offer' })
    //         .sort(sort)
    //         .limit(limit)
    //         .skip((page - 1) * limit)
    //         .exec();
    //     } else {
    //         console.log("Category not found");
    //         productList = []; // or handle the "category not found" case as needed
    //     }
    // } else {
    //     productList = await Product.find({
    //         delete: false,
    //         $or: [{ name: { $regex: search, $options: "i" } }]
    //     })
    //     .populate('category')
    //     .populate({ path: 'offer' })
    //     .sort(sort)
    //     .limit(limit)
    //     .skip((page - 1) * limit)
    //     .exec();
    // }
       

    //     // counting all product 
    //     const count= await product.find({
    //         delete:false,
    //         $or:[
    //             {name:{$regex:search,$options:"i"}}
    //         ]

    //     }).populate('category').countDocuments()

    //     console.log(count);
    
    
    //     const category=await Category.find()

        
    
    //      // Render the shop view with products and categories
    // res.render('users/shop', {
    //     products: productList,
    //     categories,
    //     selectedCategory: cat,
    //     currentpage:page,
    //     nextpage:page+1,
    //     totalpage:Math.ceil(count/limit),
    //     name,
    //     search,
    //     sort,
    //     count,
    //     category
    // });

    } catch (error) { 
        
        console.log("errror from userController LoadShop",error);
    }
}

const loadproductDetails= async(req,res)=>{ 
    try {
        // collecting product id using quary
        const id= req.query.id
        




        // finiding the product in mongo db 
        const productDetails=await product.findById({_id:id}).populate('category')
        console.log(productDetails);
        
    //    finding  same category 
        const  related=await category.findById({_id:productDetails.category._id})
        console.log("category is :", related);
        //  after find category finding same catgory product 
        const  relatedProduct= await product.find({category:related})

        console.log(related._id);
    
       
        
         

 
        if(relatedProduct)
        {
            console.log("related product  ",relatedProduct)
        }
        else
        {
            console.log("related product not finding",related._id);
        }

        // calculatng one product total stock
        let totalstock;
        if(productDetails)
        {
            // console.log("category ",relatedProduct)
         
           totalstock = productDetails.stock.XS + productDetails.stock.S + productDetails.stock.M + 
           productDetails.stock.L + productDetails.stock.XL + productDetails.stock.XXL;
                       console.log("total stock is ",totalstock);
        }
        else{
            console.log("its no stock this id",id);
        }
    
                          
      
 
          

     
        console.log(totalstock);
      


        // review checking
        const RatingProduct=await Rating.find({productId:id})
        const CountRating=await Rating.find({productId:id}).countDocuments()
        console.log("count rating",CountRating);
        

        // Retrieve the totalstars value
        // const totalStars = productDetails.Rating[0].totalstars ? productDetails.Rating[0].totalstars : 0;

        // console.log('Total Stars:', totalStars);


        if(RatingProduct)
            res.render('users/product_details',{product:productDetails,totalstock:totalstock,relatedProduct:relatedProduct,RatingProduct,CountRating})

        else
        // passing to the front end
        res.render('users/product_details',{product:productDetails,totalstock:totalstock,relatedProduct:relatedProduct})
    } catch (error) {
        
        console.log("error from userController load  product details",error);
    }
}
 
const notifyProduct = async(req,res)=>{
    try {
        Notifying(req.body.email)
        .then((result)=>{
            // res.render('users/product_details',{msg:'Check your mail'})
            res.redirect('/shop')
            console.log(result);
        })
        .catch((error)=>{
            res.render('users/product_details',{msg:"Network Issue  try Later"})
            console.log(error);
        })

        
    } catch (error) {
        
        console.log("error from usercontroller notifyProduct",error);
    }
}


const loadProfile= async (req,res)=>{
    try {

        // const {cartId}=req.query
        // console.log("cartId",cartId);      
        
        let name=""

if(req.session.user)
    {
        name=req.session.user.username

    }


        const id=req.session.user._id
        console.log("loadprofile", id);
        const userAddress=await Address.find({userId:id})
        const transaction=await Transaction.find({userId:id}).populate('productIdInOrder')
        const transactionArray = Array.isArray(transaction) ? transaction : [];
console.log("transaction",transaction);
console.log("transaction",transactionArray);

        console.log("userAddress: ",userAddress);
        const userData=await User.findOne({_id:id})
        const OrderData= await Order.findOne({userId:id}).populate('products.productId');

        // console.log("orders", OrderData);
        let OrderWallet;
        if(OrderData)
            {
                OrderWallet = OrderData.products.find(order => order.payment_method.method === 'Wallet');

                
            }




        console.log("wallet product ",OrderWallet);

        if(userData)
        {

            res.render('users/profile',{user:userData,userAddress:userAddress , order:OrderData,msg:"",OrderWallet:OrderWallet ,transaction ,name})
        }
        
    
    } catch (error) {
        
        console.log("error from userCintroller loadProfile",error);
    }
}


const loaduserEdit=async (req,res)=>{
    try {
        const id=req.query.id
        const user=await User.findById({_id:id})

        res.render('users/user-edit',{user})
       

        
        
    } catch (error) {
        
        console.log("error from user controller loaduserEdit",error);
    }
}


const EditUser= async(req,res)=>{
    try {
        const id=req.query.id
  const username= req.body.username
const email= req.body.email
const mobile= req.body.mobile

const useredit=await User.findByIdAndUpdate({_id:id},{
    $set:{
        username:username,
        email:email,
        mobile:mobile
    }
})
if(useredit)
{
    req.session.user.email=email
    req.session.user.username=username

    res.redirect('/profile#account-detail')

}



        
    } catch (error) {
        console.log("error from usercontroller useredit",error);
        
    }
}


const loadChangepassword= async(req,res)=>{
    try {
        res.render('users/changepassword')

        
    } catch (error) {
        console.log("error from userController loadChangepassword",error);
        
    }
}

const changePassword=async(req,res)=>{
    try {
       const id=req.query.id
       const password=req.body.password
    
       const cpassword=req.body.cpassword
       
       const userData=await User.findById({_id:id})
       if(userData)
       {
        const passwordMatch=await bcrypt.compare(password,userData.password)
        if(passwordMatch)
        {
         
            const Spassword= await securePassword.Securepassword(cpassword)
           
            

                const user= await User.findByIdAndUpdate({_id:id},{
                    $set:{password:Spassword}
                })
                if(user)
                {
                    res.redirect('/profile#account-detail')
                }
                else
                {
                    res.render('users/changepassword',{msg:"Not updating Your Password"})
                }
                        
        }
        else
        {
            res.render('users/changepassword',{msg:"curnnent password is incurrect"})
        }
       }       

        
    } catch (error) {
        
        console.log("error from usercontroller changePassword",error);
    }
}

const loadaddAddress=async(req,res)=>{
    try {

        const id=req.query.id
        const userAddress=await Address.find({userId:id})
        

        res.render('users/addaddress',{userAddress})

        
    } catch (error) {
        
        console.log("error from userController loadaddAddress",error);
    }
}


const addAddress=async(req,res)=>{
    try {
        
        const userId= req.query.id
        // const fullname=req.body.full_name
        // const country=req.body.country
        // const state=req.body.state
        // const city=req.body.city
        // const pincode=req.body.pincode
        // const mobile=req.body.mobile
        // const street=req.body.street
        const {full_name,country,state,city,pincode,mobile,street}=req.body


         

        let newaddress= {
            name:full_name,
            mobile:mobile,
            country:country,
            state:state,
            city:city,
            street:street,
            pincode:pincode
        

        }
        let userAddress=await Address.findOne({userId:userId})
        if(!userAddress)
        {
            newaddress.isDefault=true
            userAddress=new Address({userId:userId,
            address:[newaddress]})
        }else
        {
            userAddress.address.push(newaddress)
            if(userAddress.address.length==1)
            {
                userAddress.address[0].isDefault=true
            }
        }
        const addedaddress=await userAddress.save()
        if(addedaddress)
        {
            // Assuming address is successfully added

         res.redirect('/profile#address')

        }
       

      } catch (error) {
        
        console.log("error from usercontroller addAddress",error);
    }
}

const loadAddressEdit=async(req,res)=>{
    try {
        const addressId=req.query.id
      
       

        
        const userAddress=await Address.findOne({
            userId:req.session.user._id})

            const findAddress = userAddress.address.find(addr => addr._id.toString() === addressId);
            console.log("Finding address:", findAddress);
            




        // console.log(userAddress);
        res.render('users/address_edit',{userAddress:findAddress})
       
        
    } catch (error) {
        
        console.log("error from userCOntroller loadAddressEdit",error);
    }
}

const editAddress= async(req,res)=>{
    try {
        console.log("edt addreds rendered");

        const addressId=req.query.id
      
        const fullname=req.body.full_name
        const country=req.body.country
        const state=req.body.state
        const city=req.body.city
        const pincode=req.body.pincode
        const mobile=req.body.mobile
        const street=req.body.street

        const userAddress=await Address.findOne({
            userId:req.session.user._id})

        const findAddress = userAddress.address.find(addr => addr._id.toString() === addressId);
        

       if(findAddress )
       {
        console.log("finding addresss",findAddress);




        findAddress.name=fullname;

        
        findAddress.mobile=mobile;
        findAddress.country=country;
        findAddress.state=state;
        findAddress.city=city;
        findAddress.street=street;
        findAddress.pincode=pincode


        const saved=await userAddress.save()
        if(saved)
        res.redirect('/profile#address')
    
        else
        res.render('users/address_edit',{msg:'address not edited'})

       }
        
    } catch (error) {
        
        console.log("error from usercontroller editAddress",error);
    }
}
const removeAddress= async(req,res)=>{
    try {
        const userId= req.session.user._id
        const addressId = req.query.id || req.body.id;
        
        const userAddress=await Address.findOne({userId:userId})
        if(userAddress)
        {
            const addressIndex = userAddress.address.findIndex(addr => addr._id.toString() === addressId);

            if (addressIndex !== -1) {
                // Remove the subdocument at the found index
                userAddress.address.splice(addressIndex, 1);
            
                // Save the changes
                await userAddress.save();
                
            
                res.status(200).json({message:"Address removed successfully"})
            }
            else
            {
                res.status(404).json({ error: "Address not found" }); // Update to return JSON response
            }
        }
        
    } catch (error) {
        
        console.log("error from usercintroller removeAddress",error);
    }
}


const setDefaultAddress= async(req,res)=>{
    try {
        
        const addressId= req.query.id
        const userId= req.session.user._id
        const userAddress=await Address.findOne({userId:userId})
        if(userAddress)
        {
            const defaultremove=await userAddress.address.find(add=>add.isDefault===true)
            if(defaultremove)
            {
                defaultremove.isDefault=false
            }
            const findAddress= await userAddress.address.find(addr => addr._id.toString() === addressId);
            if(findAddress)
            {
                findAddress.isDefault=true
                
                await userAddress.save()
                res.redirect('/profile#address')
            }
        }
    } catch (error) {
        
        console.log("error from usercontroller setDefaultAddress",error);
    }
}




// const profileLoadorderlist=async(req,res)=>{
//     try {
//         const userId= req.session.user._id

//         const orderData= await Order.find({userId:userId})




        
//     } catch (error) {
        
//         console.log("error from userController profileLoadorderlist",error);
//     }
// }
const cancelOrder = async (req, res) => {
    try {
        console.log("Order data remaining");

        const userId=req.session.user._id
        const { orderId, productId } = req.body;
        console.log("body",req.body);
        const orderData = await Order.findById(orderId);

        if (!orderData) {
            console.log("Error finding order data");
            return res.status(400).json({ success: false, message: "Something wrong, try again later" });
        }

        const orderDetails = orderData.products.find(pro => pro._id.toString() === productId);
        

        if (!orderDetails) {
            console.log("Error finding order details");
            return res.status(400).json({ success: false, message: "Something wrong, try again later" });
        }else{

      

        

        const size = orderDetails.size;
        const quantity = orderDetails.quantity;
        const productIdd = orderDetails.productId;
        

        if (!productIdd) {
            console.log("Product not found");
            return res.status(400).json({ success: false, error: "Something wrong cancelling order" });
        }

        
 
        const updateObject = {};
        updateObject[`stock.${size.toUpperCase()}`] = quantity; // Increment the stock of the corresponding size by the cancelled quantity

        const productData = await Product.findByIdAndUpdate(productIdd, { $inc: updateObject }, { new: true });

        if (!productData) {
            console.log("Error updating product data");
            return res.status(500).json({ success: false, message: "Internal server error" });
        }

          
        console.log("Product updated", productData);
                
const productIndex = orderData.products.findIndex(pro => pro._id.toString() === productId);
                
if (productIndex!== -1) {
    // Product found, update its status
    orderData.products[productIndex].product_orderStatus = 'cancelled';

    
} else {
    console.log("Product not found in the order.");
}
let walletMessage = '';

if(orderDetails.payment_status==="Success")
    {
        console.log("this product is Online payment");
        const wallet=orderDetails.productPrice
        console.log("wallet : ",wallet);
        const addWallet = await Order.findByIdAndUpdate(orderId, { $inc: { Wallet: wallet } }, { new: true });
       
        // Record the transaction history
        const transaction = new Transaction({
           
            userId:userId,
            // orderId: orderId,
            productIdInOrder: productId,
            size: size.toUpperCase(),
            quantity: quantity,
            price: wallet,
            type:orderDetails.payment_method.method ,
        });

    await transaction.save();
    
        if(addWallet)
            {
                console.log('Updated order:', addWallet);
                  await addWallet.save()
                orderDetails.payment_status="Failed"
                const walletDetails=addWallet.Wallet
                console.log("total wallet ",walletDetails);
                walletMessage = `Increased Wallet by ${wallet}. Total Wallet: ${walletDetails}`;

                // res.status(200).json({success:true,message:`Increased Wallet ${wallet}  Total Wallet ${walletDetails}`})
                
            }
       
    
        else
        console.log("wallet not added");


    }


    await orderData.save()

     
    const responseMessage = walletMessage ? `Order cancelled successfully. ${walletMessage}` : 'Order cancelled successfully.';

        res.status(200).json({ success: true ,message:responseMessage});
    } 
} catch (error) {
        console.log("Error from userController cancelOrder", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};




const return_order= async(req,res)=>{
    try {
        console.log("return function Runnning");
        

        const { orderId, productId,returnReason } = req.body; 
        console.log("return reson :",returnReason);
        const orderData = await Order.findById(orderId);
        if (!orderData) {
            console.log("Error finding order data");
            return res.status(400).json({ success: false, message: "Something wrong, try again later" });
        }


        const orderDetails = orderData.products.find(pro => pro._id.toString() === productId);
        

        if (!orderDetails) {
            console.log("Error finding order details");
            return res.status(400).json({ success: false, message: "Something wrong, try again later" });
        }else{

      

        

        const size = orderDetails.size;
        const quantity = orderDetails.quantity;
        const productIdd = orderDetails.productId;


        if (!productIdd) {
            console.log("Product not found");
            return res.status(400).json({ success: false, error: "Something wrong cancelling order" });
        }

        
 
        const updateObject = {};
        updateObject[`stock.${size.toUpperCase()}`] = quantity; // Increment the stock of the corresponding size by the cancelled quantity

        const productData = await Product.findByIdAndUpdate(productIdd, { $inc: updateObject }, { new: true });

        if (!productData) {
            console.log("Error updating product data");
            return res.status(500).json({ success: false, message: "Internal server error" });
        }

          
        console.log("Product updated", productData);
                
const productIndex = orderData.products.findIndex(pro => pro._id.toString() === productId);


        
if (productIndex!== -1) {
// Product found, update its status
orderData.products[productIndex].product_orderStatus = 'Return pending';
orderData.products[productIndex].message=returnReason


} else {
  console.log("Product not found in the order.");
}
if(orderDetails.payment_status==="Success")
{
console.log("this product is Online payment");
const wallet=orderDetails.productPrice
console.log("wallet : ",wallet);
const addWallet = await Order.findByIdAndUpdate(orderId, { $inc: { Wallet: wallet } }, { new: true });
if(addWallet)
    {
        console.log('Updated order:', addWallet);
          await addWallet.save()
        orderDetails.payment_status='Failed'


    }


else
console.log("wallet not added");


}

    await orderData.save()

    res.status(200).json({ success: true });
} 
    } catch (error) {
        
        console.log("errror from userContrloer return_order",error);
    }
}


const loadoderDetails=async(req,res)=>{
    try {
        console.log("load order details");
        const userId=req.session.user._id
       const orderId=req.query.id
       console.log("orderId ",orderId);

       const orderData = await Order.findOne({ userId: userId, 'products._id': orderId }).populate('products.productId').populate('products.coupon')
       if(orderData)
            {
                console.log("order data find",orderData);
                const orderIdd=orderData._id
                console.log("order",orderIdd);
                const orderDetails= orderData.products.find(pro=>pro._id.toString()===orderId)
                if(orderDetails)
                    {
                        // const coupon=await  Coupon.findById(orderDetails.coupon)
                        // console.log("coupon",coupon);
                     
                        console.log("find order detailas");
                        res.render('users/orderDetails',{order:orderDetails,userOrder: { address: orderData.address },orderIdd})
                    }else
                    {
                        console.log("orderDetails not founded");
                    }
            }
            else
            {
                console.log("orderData not found");
            }
    } catch (error) {
        
        console.log("error from usserController loadoderDetails",error);
    }
}


const loadInvoice=async(req,res)=>{
    try {
        const userId=req.session.user._id
        const orderId=req.query.orderId


        const user=req.session.user.username
        console.log("username",user);
        
        
        console.log("orderId ",orderId);
       const orderData = await Order.findOne({ userId: userId, 'products._id': orderId })
       .populate('products.productId')
       .populate('products.coupon')
       .populate('userId')

       if(orderData)
            {
                console.log("userNAme",orderData.userId.username);
                console.log("order data find",orderData);
                const orderIdd=orderData._id
                console.log("order",orderIdd);
                const orderDetails= orderData.products.find(pro=>pro._id.toString()===orderId)
                if(orderDetails)
                    {
                        // const coupon=await  Coupon.findById(orderDetails.coupon)
                        // console.log("coupon",coupon);
                     
                        console.log("find order detailas");
                        res.render('users/invoice',{order:orderDetails,userOrder: { address: orderData.address },orderIdd,user:orderData})
                    }else
                    {
                        console.log("orderDetails not founded");
                    }
            }
            else
            {
                console.log("orderData not found");
            }
        
    } catch (error) {
        
        console.log("error from userControllwer loadInvoice",error);
    }
}



const sumbmitReview=async(req,res)=>{
    try {

        const userId= req.session.user._id
       
        
        const {rating,comment,name,productId}=req.body 
        const existingReview = await Rating.findOne({ userId, productId });
        if (existingReview) {
                return res.status(400).json({ message: 'You have already reviewed this product.' });
        }
        
        await Product.updateOne(
            { _id: productId },
            {
                $inc: { numReview: 1, totalstars: rating }
            }
        );
        const newRating= await  Rating.create({
            userId:userId,
            productId:productId,
            starRating:rating,
            review:comment,
            name:name


        })
        
           

        const savedRating = await newRating.save();

       
        if(savedRating)
            res.status(201).json({success:true,savedRating});
          else
        res.status(200).json({success:false})
        
    } catch (error) {
        
        console.log("error from userContyroller sumbmitReview",error);
    }
}



// expporting the functions
module.exports={
    loadlandingPage,
    loadhome,
    loadLogin,
    loadSignup,
    insertUser,
    loadOTP,
    verifyOtp,
    resendOtp,
    verifyLogin,
    LoggedOut,
    Loadforgot,
    forget_password,
    LoadReset_password,
    reset_password,
   
    loadSuccesGoogle,
    loadFailurGoogle,

    LoadShop,
    loadproductDetails,
    notifyProduct,

    loadProfile,
    loaduserEdit,
    EditUser,
    loadChangepassword,
    changePassword,
    loadaddAddress,
    addAddress,
    loadAddressEdit,
    editAddress,
    removeAddress,
    setDefaultAddress,
    // profileLoadorderlist,
    cancelOrder,
    return_order,
    loadoderDetails,
    loadInvoice,
    sumbmitReview
    
}