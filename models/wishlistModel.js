const mongoose=require('mongoose')
const wishlistSchema=mongoose.Schema({



    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        require:true
    },
    products:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"products",
            require:true
        }
    }]

})
module.exports=mongoose.model('wishlist',wishlistSchema)