const User= require('../models/userModel')
const Address=require('../models/addressModel')
const Product=require('../models/productModel')
const Cart=require('../models/cartModel')
const Order=require('../models/orderModule')
require('dotenv').config()
const Razorpay=require('razorpay')
const { v4: uuidv4 } = require('uuid');
const Coupon=require('../models/couponModel')

// Generate a unique receipt ID using uuid
const receiptId = uuidv4();




// RazorPayyy


const instance = new Razorpay({
    key_id: process.env.RazorPayId,
    key_secret: process.env.RazorPaySecret
    })


// 








const loadOder=async(req,res)=>{    
    try {
        const cartId= req.query.id
        const userId=req.session.user._id
        let totalprice=0
        req.session.returnTo = req.originalUrl;
        console.log("cartId  : :",cartId);
    

        const user = await User.findById(userId).populate('coupons');

        const userAddress=await Address.find({userId:userId})
        // console.log("userAddress" , userAddress);
        
        

        const cartData= await Cart.findById({_id:cartId}).populate({path:'products.productId'})
       
        if(cartData)
        {
         
            console.log("hao");
        cartData.products.forEach(pro => {
            totalprice+=pro.total_price
            
        });



            // const couponData=await Coupon.find({MinimumOrder_amount:{$gte:totalprice},
            //     Ending_Date: { $gte: new Date() }})
            const now = new Date();
            const allCoupons = await Coupon.find({
                MinimumOrder_amount: { $lte: totalprice },
                MaximumOrder_amount: { $gte: totalprice },
                Ending_Date: { $gte: now }
            });
            const unusedCoupons = allCoupons.filter(coupon => !user.coupons.some(usedCoupon => usedCoupon._id.equals(coupon._id)));
        
            res.render('users/orders',
            {order:cartData,
                totalprice,
                Address:userAddress,
            cartId:cartId,
        coupon:unusedCoupons})
 
            
            
        }
        






        
        
 
        
    } catch (error) {
        
        console.log("error from oderController  loadOder",error);
    }
}

const loadEditAddress= async(req,res)=>{
    try {

        const addressId=req.query.id

        
        const userAddress=await Address.findOne({
            userId:req.session.user._id})

            const findAddress = userAddress.address.find(addr => addr._id.toString() === addressId);
            console.log("Finding address:", findAddress);
            




        // console.log(userAddress);
        res.render('users/address_edit',{userAddress:findAddress})
       
        
    } catch (error) {
        
        console.log("error from orderController loadEditAddress",error);
    }
}



const Editaddress = async (req, res) => {
    try {
        const addressId = req.query.id;

        // Validate inputs
        if (!addressId || !req.session.user || !req.body) {
            throw new Error('Invalid request data');
        }

        const { full_name, country, state, city, pincode, mobile, street } = req.body;

        const userAddress = await Address.findOne({ userId: req.session.user._id });

        // Find the address to update
        const findAddress = userAddress.address.find(addr => addr._id.toString() === addressId);
        if (!findAddress) {
            throw new Error('Address not found');
        }

        // Update address properties
        findAddress.name = full_name;
        findAddress.mobile = mobile;
        findAddress.country = country;
        findAddress.state = state;
        findAddress.city = city;
        findAddress.street = street;
        findAddress.pincode = pincode;

        // Save the updated address
        const saved = await userAddress.save();
        if (saved) {
            // Redirect back to the previous page
            res.redirect(req.session.returnTo);
        }
    } catch (error) {
        console.error("Error from order Controller Editaddress", error);
        // Handle the error appropriately, perhaps by sending an error response
        res.status(500).send('Internal Server Error');
    }
};




// const UsingAddress=async(req,res)=>{
//     try {

//         const addressId= req.query.id
//         const userId= req.session.user._id
//         const userAddress=await Address.findOne({userId:userId})
//         if(userAddress)
//          {
//             const defaultremove=await userAddress.address.find(add=>add.isDefault===true)
//             if(defaultremove)
//             {
//                 defaultremove.isDefault=false
//             }
//             const findAddress= await userAddress.address.find(addr => addr._id.toString() === addressId);
//             if(findAddress)
//             {
//                 findAddress.isDefault=true
                
//                 await userAddress.save()
//                 res.redirect('back')
//             }
//         }
        
//     } catch (error) {
        
//         console.log("error from orderController UsingAddress",error);
//     }
// }


const newAddress= async(req,res)=>{
    try {


        const userId= req.session.user._id
        const fullname=req.body.full_name
        const country=req.body.country
        const state=req.body.state
        const city=req.body.city
        const pincode=req.body.pincode
        const mobile=req.body.mobile
        const street=req.body.street


        
        let newaddress= {
            name:fullname,
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
            res.redirect('back')

        }
        
        
    } catch (error) {
        
        console.log("error form order Controller newAddress",error);
    }
}

const cartOrderPayment=async(req,res)=>{
    try {
        console.log("cart order payment rendering");

        let couponId;
        const userId=req.session.user._id


        if( req.session.userCoupon){

            couponId= req.session.userCoupon
            console.log("session Id .",req.session.userCoupon);
            console.log("session Id .",couponId);
            

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found." });
            }
            console.log("User found");
    
            // Check if coupon exists
            const coupon = await Coupon.findById(couponId);
            if (!coupon) {
                return res.status(404).json({ success: false, message: "Coupon not found." });
            }
            console.log("Coupon found");
          





             /// Add coupon to user's coupons array
        user.coupons.addToSet(couponId); // Using addToSet to avoid duplicates
        await user.save(); // Save the user document
                // Decrement coupon count and save in one step
        const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, {
            $inc: { coupon_Count: -1 }
        }, { new: true });

        if (updatedCoupon.coupon_Count < 0) {
            // Revert the user's coupon update if the coupon count goes below zero
            user.coupons.pull(couponId);
            await user.save();
            return res.status(400).json({ success: false, message: "Coupon is no longer available." });
        }
        }

       
        const cartId=req.body.cartId
        const addressid = req.body.addressid;
    const payment_method = req.body.payment_method;
    const amount = req.body.totalPrice;

 
    if(payment_method)
    {
          console.log("Payment method : ", typeof payment_method); 
           console.log("Payment method : ", payment_method);
        } 
    
    console.log("totalprice ", amount);


        
     
        
        console.log("cart id: ",cartId);
        // const addressid=req.body.addressid
        console.log("address id  = ",addressid);

        const cartData = await Cart.findOne({ _id: cartId }).populate({ path: 'products.productId' });

        console.log("carTData :",cartData);
        // Check if cartData is not null before proceeding



        
         const addressData = await Address.findOne({userId:userId})
       
         const addressfind = addressData.address.find(adr => {
             console.log('Checking address:', adr._id.toString()==addressid.toString());
             console.log('adr._id:', adr._id, 'addressid:', addressid);
 
             return adr._id.toString() === addressid.toString();
         });
         
         console.log('Found address:', addressfind);


         let addressDetails={

            name:addressfind.name,
            mobile:addressfind.mobile,
            country:addressfind.country,
            state:addressfind.state,
            city:addressfind.city,
            street:addressfind.street,
            pincode:addressfind.pincode
        
         }



        if (!cartData) {
            console.error("Cart not found");
            // Handle the error appropriately, such as returning a response or redirecting
            return;

        }  
        
       
                      


        
        const OrderData = await Order.findOne({ userId: userId });
        console.log("orderDasta",OrderData);
  

        // const validPaymentMethods = ['cod', 'wallet', 'razorpay'];
      


        if(payment_method=="cod")
            {

            
    




        if(!OrderData){
                // If there's no existing order, create a new one

      const newOrderProducts = cartData.products.map(product => {
    console.log("product _id",product.productId._id); // Access and log the size of each product
    return {
        productId: product.productId,
        size: product.size,
        quantity: product.quantity,
        total_price: product.total_price
    };
});

    
console.log("size newoewOrderProducts : ", newOrderProducts);
console.log("size newoewOrderProducts size : ", newOrderProducts.size);


console.log("address.address.name",addressData.address.name);
         const newOrder= new Order({
                userId,
                products:newOrderProducts.map(product => ({
                        productId: product.productId,
                       
                        size: product.size,
                        productPrice: amount,
                        product_orderStatus:'pending',
                        payment_method: { method: payment_method },

                    }))
                    ,address:[addressDetails],
                    totalPrice:amount,
                    
                    


                
                        
                });
                
  
        

            await newOrder.save()
            .then(res=>console.log("newOrderSaved",res))
            .catch(rej=>console.log("new Order Not Saved",rej))


            console.log("new order saved"); 



           

            for (const item of cartData.products) {
                const productId = item.productId;
                const size = item.size;
                const quantity = item.quantity;
                console.log('size ' ,size);
                console.log("product isdddd",productId);
            
                // Construct the update object based on the size and quantity
                const updateObject = {};
                updateObject[`stock.${size}`] = -quantity; // Decrease the stock of the corresponding size by the quantity
            
                // Update the product stock
                const updatedProduct = await Product.findByIdAndUpdate(
                    productId,
                    { $inc: updateObject }, // Update the stock dynamically based on the size and quantity
                    { new: true } // To return the updated document
                );
            
                await updatedProduct.save()
                console.log("Updated product:", updatedProduct);
            }
            
      
        
        } else
        {
            if (!Array.isArray(OrderData.order)) {
                OrderData.order = [];
            }
            const orderProducts = cartData.products.map(product => ({
                productId: product.productId._id,
                size: product.size,
                quantity: product.quantity,
                productPrice:amount ,
                product_orderStatus:'pending',
                payment_method: { method: payment_method },
                coupon:couponId||null
            }));
        
                    
            console.log("cartData.products._id",orderProducts._id);
           
            
         
           
                    OrderData.products.push(...orderProducts);

                
           
            OrderData.address=[addressDetails]
            OrderData.totalPrice=amount
           
           
            // OrderData.order_status='pending'




            await OrderData.save();
            console.log("Order updated");

                
            for (const item of cartData.products) {
                const productId = item.productId._id;
                console.log("product iddd ",productId);
                const size = item.size;
                const quantity = item.quantity;
                console.log("quatittyyyy",quantity);
                console.log('size ' ,size);

            
                // Construct the update object based on the size and quantity
                const updateObject = {};
                updateObject[`stock.${size}`]= -quantity; // Decrease the stock of the corresponding size by the quantity
            
                
                console.log("update Object = ",updateObject);
                // Update the product stock
                const updatedProduct = await Product.findByIdAndUpdate(
                    productId,
                    { $inc: updateObject }, // Update the stock dynamically based on the size and quantity
                    { new: true } // To return the updated document
                );
            
                if(updatedProduct)
                    {
                        await updatedProduct.save()
                        console.log("Updated product:", updatedProduct);

                    }
                
            else
            console.log("error making uipdate the product");
            }


        }
        //    res.redirect(`/product/order?id=${cartId}&order=success`); // Replace '/success' with the URL of your success page
        res.status(200).json({ success: true});
    

    } 
   
        
    } catch (error) { 
        console.log("error from ordercontroler cartOrderPayment",error);
    }
}


const razorypay_payment=async (req,res)=>{
    try {
        
        const {amount}=req.body            // Generate a unique receipt ID by combining static text with a timestamp
        const receiptId = `order_rcpt_${Date.now()}`;
        
           // Create a new Razorpay order
           const order = await instance.orders.create({ 
            amount: amount, // Amount in smallest currency unit
            currency: 'INR',
            receipt: receiptId// Provide a unique receipt ID
        });
        
        res.status(200).json({ orderId: order.id });
        





        
    } catch (error) {
        
        console.log("error from orderController razorypay_payment",error);
    }
}

const verify_Payment = async(req,res)=>{
    try {
        console.log("verify payment running");





        let couponId;
        const userId=req.session.user._id


        if( req.session.userCoupon){

            couponId= req.session.userCoupon
            console.log("session Id .",req.session.userCoupon);
            console.log("session Id .",couponId);
            

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found." });
            }
            console.log("User found");
    
            // Check if coupon exists
            const coupon = await Coupon.findById(couponId);
            if (!coupon) {
                return res.status(404).json({ success: false, message: "Coupon not found." });
            }
            console.log("Coupon found");
          





             /// Add coupon to user's coupons array
        user.coupons.addToSet(couponId); // Using addToSet to avoid duplicates
        await user.save(); // Save the user document
                // Decrement coupon count and save in one step
        const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, {
            $inc: { coupon_Count: -1 }
        }, { new: true });

        if (updatedCoupon.coupon_Count < 0) {
            // Revert the user's coupon update if the coupon count goes below zero
            user.coupons.pull(couponId);
            await user.save();
            return res.status(400).json({ success: false, message: "Coupon is no longer available." });
        }
        }
        

        const {data,payload}= req.body;
        //  console.log("Payment details:", payment);
        // console.log("Order details:", order);
        console.log("payment ;",payload);
        console.log("orderbData : ",data);
        const cartId=data.cartId
        const addressid=data.address
        // const userId=req.session.user._id
        const amount=data.amount
        let delivery=0;
        if(amount<1000)

            {

                delivery=50


            }
        const cartData = await Cart.findOne({ _id: cartId }).populate({ path: 'products.productId' });

        // console.log("carTData :",cartData);
        // Check if cartData is not null before proceeding



        
         const addressData = await Address.findOne({userId:userId})
       
         const addressfind = addressData.address.find(adr => {
            //  console.log('Checking address:', adr._id.toString()==addressid.toString());
            //  console.log('adr._id:', adr._id, 'addressid:', addressid);
 
             return adr._id.toString() === addressid.toString();
         });
         
         console.log('Found address:', addressfind);


         let addressDetails={

            name:addressfind.name,
            mobile:addressfind.mobile,
            country:addressfind.country,
            state:addressfind.state,
            city:addressfind.city,
            street:addressfind.street,
            pincode:addressfind.pincode
        
         }

         const OrderData = await Order.findOne({ userId: userId });
        
   

        const crypto = require('crypto')    
        
      
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = payload.payment;
               
                console.log("razorpay payment id",razorpay_payment_id);
                console.log("razorpay order id",razorpay_order_id);
                
                let hmac = crypto.createHmac("sha256","bFrIvz1nr8GXtURf3crxJw73" );
                hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
                
                hmac = hmac.digest("hex");

      
         console.log("signature",razorpay_signature);
         console.log("hmac",hmac);


         
        // Compare calculated hash with the received signature
        if  (hmac === razorpay_signature) {
            // Signature is valid, process payment
            console.log('Payment verification successful');




            if (!Array.isArray(OrderData.order)) {
                OrderData.order = [];
            }
            const orderProducts = cartData.products.map(product => ({
                productId: product.productId._id,
                size: product.size,
                quantity: product.quantity,
                productPrice: amount,
                product_orderStatus:'pending',
                payment_method: { method: "RazorPay" },
                payment_status:"Success",
                coupon:couponId||null,
                delivery:delivery

            }));    
            // console.log("cartData.products._id",orderProducts._id);
           
            OrderData.products.push(...orderProducts);
            OrderData.address=[addressDetails]
            OrderData.totalPrice=amount
           
    




            await OrderData.save();
            console.log("Order updated");

            for (const item of cartData.products) {
                const productId = item.productId._id;
                console.log("product iddd ",productId);
                const size = item.size;
                const quantity = item.quantity;
                console.log("quatittyyyy",quantity);
                console.log('size ' ,size);

            
                // Construct the update object based on the size and quantity
                const updateObject = {};
                updateObject[`stock.${size}`]= -quantity; // Decrease the stock of the corresponding size by the quantity
            
                
                console.log("update Object = ",updateObject);
                // Update the product stock
                const updatedProduct = await Product.findByIdAndUpdate(
                    productId,
                    { $inc: updateObject }, // Update the stock dynamically based on the size and quantity
                    { new: true } // To return the updated document
                );
           
                if(updatedProduct)
                    {
                        console.log("updateded");
                
                        res.status(200).json({success:true})
                    }
            }
            

        }else

        {
            console.log("not verified");
        }



        

        
    } catch (error) {
        
        console.log("error from orderController verify_Payment",error);
    }
}

const walllet_payment=async(req,res)=>{
    try {



        const {cartId,address,amount,payment_method}=req.body
        
        const userId=req.session.user._id


        
        let couponId;
       
        let deliverycharge=0;
        if(amount<1000)
            {
                deliverycharge=50
                
            }
            console.log("delivery",deliverycharge);


        if( req.session.userCoupon){

            couponId= req.session.userCoupon
            console.log("session Id .",req.session.userCoupon);
            console.log("session Id .",couponId);
            

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found." });
            }
            console.log("User found");
    
            // Check if coupon exists
            const coupon = await Coupon.findById(couponId);
            if (!coupon) {
                return res.status(404).json({ success: false, message: "Coupon not found." });
            }
            console.log("Coupon found");
          





             /// Add coupon to user's coupons array
        user.coupons.addToSet(couponId); // Using addToSet to avoid duplicates
        await user.save(); // Save the user document
                // Decrement coupon count and save in one step
        const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, {
            $inc: { coupon_Count: -1 }
        }, { new: true });

        if (updatedCoupon.coupon_Count < 0) {
            // Revert the user's coupon update if the coupon count goes below zero
            user.coupons.pull(couponId);
            await user.save();
            return res.status(400).json({ success: false, message: "Coupon is no longer available." });
        }
        }
        
      
        console.log(`cart ${cartId}, address ${address}, amount ${amount}`);
        const cartData = await Cart.findOne({ _id: cartId }).populate({ path: 'products.productId' });

        const addressData = await Address.findOne({userId:userId})
       
        const addressfind = addressData.address.find(adr => {
            return adr._id.toString() === address.toString();
        });
        const OrderData = await Order.findOne({ userId: userId });
        console.log("order wallet",OrderData.Wallet);



        if(amount > OrderData.Wallet)
            {
                res.status(200).json({success:false,message:`You Have Only ${OrderData.Wallet} in your Wallet`})
                console.log("product grter than user Wallet");
            }else

            {
                console.log("product is oKkk");

                

         let addressDetails={

            name:addressfind.name,
            mobile:addressfind.mobile,
            country:addressfind.country,
            state:addressfind.state,
            city:addressfind.city,
            street:addressfind.street,
            pincode:addressfind.pincode
        
         }

         
         if (!Array.isArray(OrderData.order)) {
            OrderData.order = [];
        }
        const orderProducts = cartData.products.map(product => ({
            productId: product.productId._id,
            size: product.size,
            quantity: product.quantity,
            productPrice: amount,
            product_orderStatus:'pending',
            payment_method: { method: "Wallet" },
            payment_status:"Success",
            coupon:couponId||null,
            delivery:deliverycharge
        }));
    
     
     
        OrderData.products.push(...orderProducts);
        OrderData.address=[addressDetails]
        OrderData.totalPrice=amount
       


        OrderData.Wallet=OrderData.Wallet-amount
        console.log("upadted orderData",OrderData.Wallet);




        await OrderData.save();
        // const products_id=OrderData.products._id
        // console.log("products _id ",OrderData.products._id);
        console.log("Order updated");
    //      // Record the transaction history
    //      const transaction = new Transaction({
           
    //         userId:userId,
    //         // orderId: orderId,
    //         productIdInOrder: productId,
    //         size: size.toUpperCase(),
    //         quantity: quantity,
    //         price: wallet,
    //         type:orderDetails.payment_method.method ,
    //     });

    // await transaction.save();
    

       


        for (const item of cartData.products) {
            const productId = item.productId._id;
            console.log("product iddd ",productId);
            const size = item.size;
            const quantity = item.quantity;
            console.log("quatittyyyy",quantity);
            console.log('size ' ,size);

        
            // Construct the update object based on the size and quantity
            const updateObject = {};
            updateObject[`stock.${size}`]= -quantity; // Decrease the stock of the corresponding size by the quantity
        
            
            console.log("update Object = ",updateObject);
            // Update the product stock
            const updatedProduct = await Product.findByIdAndUpdate(
                productId,
                { $inc: updateObject }, // Update the stock dynamically based on the size and quantity
                { new: true } // To return the updated document
            );
            if(updatedProduct)
                {
                    console.log("updateded");
            
                    res.status(200).json({success:true})
                }


            }
        }
        


        
    } catch (error) {
        
        console.log("errror from prderController walllet_payment",error);
    }
}


const payment_failure=async(req,res)=>{
    try {
        
        const { cartId, amount, address } = req.query;

        console.log('Cart ID:', cartId); // Should log the correct cartId
        console.log('Amount:', amount); // Should log the correct amount
        console.log('Address:', address); // Should log the correct address
    
    
        
        // const {cartId,,,payment_method}=req.body
        const userId= req.session.user._id
        console.log("userId ",userId);
        // console.log("order id",orderId);
        const orderData=await Order.findOne({userId:userId})
               
        let couponId;
       


        if( req.session.userCoupon){

            couponId= req.session.userCoupon
            console.log("session Id .",req.session.userCoupon);
            console.log("session Id .",couponId);
            

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found." });
            }
            console.log("User found");
    
            // Check if coupon exists
            const coupon = await Coupon.findById(couponId);
            if (!coupon) {
                return res.status(404).json({ success: false, message: "Coupon not found." });
            }
            console.log("Coupon found");
          





             /// Add coupon to user's coupons array
        user.coupons.addToSet(couponId); // Using addToSet to avoid duplicates
        await user.save(); // Save the user document
                // Decrement coupon count and save in one step
        const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, {
            $inc: { coupon_Count: -1 }
        }, { new: true });

        if (updatedCoupon.coupon_Count < 0) {
            // Revert the user's coupon update if the coupon count goes below zero
            user.coupons.pull(couponId);
            await user.save();
            return res.status(400).json({ success: false, message: "Coupon is no longer available." });
        }
        }
        
      
        console.log(`cart ${cartId}, address ${address}, amount ${amount}`);
        const cartData = await Cart.findOne({ _id: cartId }).populate({ path: 'products.productId' });

        const addressData = await Address.findOne({userId:userId})
       
        const addressfind = addressData.address.find(adr => {
            return adr._id.toString() === address.toString();
        });
        const OrderData = await Order.findOne({ userId: userId });
        console.log("order wallet",OrderData.Wallet);






        
        let addressDetails={

            name:addressfind.name,
            mobile:addressfind.mobile,
            country:addressfind.country,
            state:addressfind.state,
            city:addressfind.city,
            street:addressfind.street,
            pincode:addressfind.pincode
        
         }

         
         if (!Array.isArray(OrderData.order)) {
            OrderData.order = [];
        }
        const orderProducts = cartData.products.map(product => ({
            productId: product.productId._id,
            size: product.size,
            quantity: product.quantity,
            productPrice: amount,
            product_orderStatus:'payment failed',
            payment_method: { method: "RazorPay" },
            payment_status:"Failed",
            coupon:couponId||null,
            cartId:cartId
        }));
    
     
     
        OrderData.products.push(...orderProducts);
        OrderData.address=[addressDetails]
        OrderData.totalPrice=amount
       


        // OrderData.Wallet=OrderData.Wallet-amount
        console.log("upadted orderData",OrderData.Wallet);




      const saving= await OrderData.save();
        console.log("Order updated");



           if(saving)
            res.status(200).json({success:true,cartId:cartId})
           else
           res.status(200).json({success:false})


        
    } catch (error) {
        
        console.log("error from orderController payment_failure",error);
    }
}


const deleteOrder = async(req,res)=>{
    try {
        const {orderId}=req.query
        const userId= req.session.user._id
        console.log(`orderId${orderId}, useriD${userId}`);

        // const orderData=await Order.findOne({userId:userId})
        const orderData = await Order.findOne({ userId: userId, "products._id": orderId });
        if(orderData)
            {
                console.log("order data FInderd");

            orderData.products = orderData.products.filter(product => !( product._id.toString() === orderId));
               
            // Save the updated order document
        await orderData.save();

        res.status(200).json({ success: true });
                    console.log("orderDelete Completed...");
                } else

                {
                    res.status(404).json({ message: 'Order not found' });

                    console.log("order Not found...");
                }
        
        



    } catch (error) {
        
        console.log("error from orderController deleteOrder",error);
    }
}



module.exports={
    loadOder,
    loadEditAddress,
    Editaddress,
    newAddress,
    cartOrderPayment,
    razorypay_payment,
    verify_Payment,
    walllet_payment,
    payment_failure,
    deleteOrder
    
   
    
}