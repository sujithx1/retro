// const { timeStamp } = require('console')
const mongoose=require('mongoose')

const ratingSchema=mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'products',
        required:true
        
    },
    starRating:{
        type:Number,
        required:true
    },
    review:{

        type:String
    },
    
    date:{
        type:Date,
        default:Date.now()
    },
    name:{
        type:String,
        required:true
    }

})
module.exports=mongoose.model('rating',ratingSchema)