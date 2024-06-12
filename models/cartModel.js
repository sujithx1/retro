
const mongoose=require('mongoose')

const cartSchema=mongoose.Schema({

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
        },
        size:{
            type:String,
            require:true
        },
        quantity:{
            type:Number,
            require:true,
            default:1
        },
        total_price:{
            type:Number,
            default:0
        }
    }],
    total:{
        type:Number,
        default:0
    },
    
})

module.exports=mongoose.model('cart',cartSchema)
