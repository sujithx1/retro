const Coupon=require('../models/couponModel')
const User=require('../models/userModel')







const loadCoupons=async(req,res)=>{
    try {


        const couponData= await Coupon.find()
        if(couponData)
            {
                res.render('admin/coupons',{coupon:couponData})

            }else
            {
                console.log("no couponss find");
            }
       
        
    } catch (error) {
        
        console.log("error from coupon Controller loadCoupons",error);
    }
}

const loadaddCoupons=async(req,res)=>{
    try {
        res.render('admin/addcoupons')
        
    } catch (error) {
        
        console.log("error from coupons controller",error);
    }
}

const addCoupons= async(req,res)=>{
    try {


        console.log("add Coupons renderinggg");



        const{couponCode,couponDescription,
            offerPercentage,couponCount,
            minimumOrderAmount,
            maximumOfferAmount,
            startDate,expireDate
        }=req.body


        const uniqueCoupon= await Coupon.findOne({coupon_Code:{$regex:couponCode,$options:"i"}})
        if(uniqueCoupon)
            {
              
                res.render('admin/addcoupons',{message:"already Coupon Available "})
                return
            }
        const CouponData= await Coupon.create({
            coupon_Code:couponCode,
            coupon_Description:couponDescription,
            Offer_Percentage:offerPercentage,
            coupon_Count:couponCount,
            MinimumOrder_amount:minimumOrderAmount,
            MaximumOrder_amount:maximumOfferAmount,
            Start_Date:startDate,
            Ending_Date:expireDate,
            isBlocked:false
        })
        const couponSave=await CouponData.save()

        if(couponSave)
            {
                console.log("saved");
                res.redirect('/admin/coupons')
            }else
            {
                console.log("not saved");
            }
    



        
        
    } catch (error) {
        
        console.log("error from coupon controller addCoupons",error );
    }
}


const loadEditCoupon=async(req,res)=>{
    try {

        console.log("loadEditCoupon rendering/....");
        const couponId=req.query.id
        const couponData=await Coupon.findOne({_id:couponId})
        if(couponData)
            {
                res.render('admin/editcoupon',{coupon:couponData})
            }else
            {
                console.log("not find that coupon id");
            }
        
    } catch (error) {
        
        console.log("errro from coupon controller loadEditCoupon");
    }
}


const EditCoupon =async(req,res)=>{
    try {
        console.log("EditCoupon rendering...");
        
        const{couponCode,couponDescription,
            offerPercentage,couponCount,
            minimumOrderAmount,
            maximumOfferAmount,
            startDate,expireDate,couponId
        }=req.body


  
        const couponData=await Coupon.findByIdAndUpdate(couponId,
           {$set:{

            coupon_Code:couponCode,
            coupon_Description:couponDescription,
            Offer_Percentage:offerPercentage,
            coupon_Count:couponCount,
            MinimumOrder_amount:minimumOrderAmount,
            MaximumOrder_amount:maximumOfferAmount,
            Start_Date:startDate,
            Ending_Date:expireDate,
            isBlocked:false

            }
        },
        { new: true } // This option returns the modified document rather than the original.
    )
        if(couponData)
            {
                await couponData.save()
                console.log("saveddd");
                res.redirect('/admin/coupons')

            }else
            {
                console.log("coupon id not finddd");
            }
        
    } catch (error) {
        
        console.log("error from couponController EditCoupon",error);
    }
}
const blockandUnblockCoupon=async(req,res)=>{
    try {
        console.log("blockandUnblockCoupon renderinggg");
        const couponId = req.params.id;
        const { isBlocked } = req.body;

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            couponId,
            { isBlocked: isBlocked },
            { new: true }
        );
        if (updatedCoupon) {
            res.status(200).json({ success: true, coupon: updatedCoupon });
        } else {
            res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        
    } catch (error) {
        
        console.log("error from coupon Controller blockandUnblockCoupon",error);
    }
}
const ApplayingCoupon = async (req, res) => {
    try {
        console.log("Rendering ApplayingCoupon");

        const userId = req.session.user._id;
        const { couponId } = req.body; // Destructure couponId from req.body

        // Check if user exists
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

        // // Add coupon to user's coupons array
        // user.coupons.addToSet(couponId); // Using addToSet to avoid duplicates
        // await user.save(); // Save the user document

        req.session.userCoupon=couponId
       
        console.log("session userCoupon :",req.session.userCoupon);
        // Decrement coupon count and save in one step
        // const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, {
        //     $inc: { coupon_Count: -1 }
        // }, { new: true });

        // if (updatedCoupon.coupon_Count < 0) {
        //     // Revert the user's coupon update if the coupon count goes below zero
        //     user.coupons.pull(couponId);
        //     await user.save();
        //     return res.status(400).json({ success: false, message: "Coupon is no longer available." });
        // }
        res.status(200).json({ success: true, message: "Coupon applied successfully!" ,couponId:couponId});

    } catch (error) {
        console.error("Error from coupon controller ApplayingCoupon", error);
        res.status(500).json({ success: false, message: "An error occurred while applying the coupon." });
    }
};

const userUsedCoupon=async(req,res)=>{
    try {
        const couponId=req.session.userCoupon
        res.json({couponId})
        
    } catch (error) {
        
        console.log("error from coupon Controller userUsedCoupon",error);
    }
}


const removeCoupon=async(req,res)=>{
    try {

        const userId = req.session.user._id;
        const { couponId } = req.body; // Destructure couponId from req.body


         // Check if user exists
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


         if(req.session.userCoupon===couponId)
            {
                delete req.session.userCoupon;
                res.status(200).json({ success: true, message: "Coupon applied successfully!"})
            }
        
    } catch (error) { 
        
        console.log("error from coupon COntroller removeCoupon",error);
    }
}

module.exports={
    loadCoupons,
    loadaddCoupons,
    addCoupons,
    loadEditCoupon,
    EditCoupon,
    blockandUnblockCoupon,
    ApplayingCoupon,
    userUsedCoupon,
    removeCoupon

}