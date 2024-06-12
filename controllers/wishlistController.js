const User= require('../models/userModel')
const Product=require("../models/productModel")
const Cart = require('../models/cartModel')
const Wishlist=require('../models/wishlistModel')
// const { default: products } = require('razorpay/dist/types/products')




const loadWishlist=async(req,res)=>{
    try {

        const userId= req.session.user._id
        const wishlistData=await Wishlist.findOne({userId:userId}).populate({path:'products.productId',populate:[{path:'category'}]})
        
        res.render('users/wishlist',{wishlist:wishlistData})



        
    } catch (error) {
        
        console.log("error from wishlist Controller loadWishlist",error);
    }
}



const addtoWishlist=async(req,res)=>{
    try {
        console.log("addd to cart loading");
        const {productId}=req.body
        const userId=req.session.user._id
        let wishlistData = await Wishlist.findOne({ userId: userId });
    
        const productData=await Product.findById({_id:productId})
        console.log("product form wishlist : ",productData);


        if(!wishlistData)
            {
                wishlistData= new Wishlist({
                    userId,
                    products: [{ productId}]
                })
                const saving= await wishlistData.save()
                
                if(saving)
                    {

                        console.log("saveed");
                        res.status(200).json({ success: true });


                    }
                
            
                 else
                 console.log("not saved");
            }else

            {
                const sameProduct = wishlistData.products.find(product => product.productId.toString() === productId.toString());
                console.log("same Product : ",sameProduct);
            if(sameProduct)
                {
                    console.log("its same product");
                    res.status(200).json({success:false,message:"Product Alreaady Exist"})
                }
                else
                {
                    wishlistData.products.push({ productId });
                    await wishlistData.save();
                    res.status(200).json({ success: true });
                    console.log("Product added to wishlist");
                }
                
                

            }
            



        
    } catch (error) {
        console.log("error from whishlist Controller  addtoWishlist",error);
    }
}


const removeWishlistProduct = async(req,res)=>{
    try {
        let userId= req.session.user._id
        const productId= req.query.id
            
        let user= await Wishlist.findOne({userId:userId})
        if(user)
        {
            console.log("product id ",productId);
            let deletecart= user.products.findIndex(products=>products._id==productId)

            if (deletecart !== -1) {
                user.products.splice(deletecart, 1);
                await user.save();

                res.status(200).json({ success: true });
            } else {
                res.status(404).json({ success: false, message: 'Product not found in wishlist' });
            }
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }

        
    } catch (error) {
        
        console.log("error from cart Controller removeCartProduct",error);
    }
}


module.exports={

    loadWishlist,
    addtoWishlist,
    removeWishlistProduct
}