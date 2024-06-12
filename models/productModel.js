const mongoose=require('mongoose')

// //   image: [{
//     type: String,
// }],
//  storing multiple image url  thats why image field will array and we taking url so url will bw string
const productSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:[{
        type:String
    }],
    price:{
        type:Number,
        required:true
 
    },
    promo_price:{
        type:Number,
        required:true

    },
        stock:{
            XS: {
                type: Number,
                default: 0
            },
            S: {
                type: Number,
                default: 0
            },
            M: {
                type: Number,
                default: 0
            },
            L: {
                type: Number,
                default: 0
            },
            XL: {
                type: Number,
                default: 0
            },
            XXL: {
                type: Number,
                default: 0
            },
        },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'category',
        required:true
    },
 
  
      numReview:{
            type:Number,
            default:0
        },
        totalstars:{
            type:Number,
            default:0
      },

    delete:{
        type:Boolean,
        default:false
    },
    date:{
        type:Date,
        default:Date.now()

    },
    offer:{ 
        type:mongoose.Schema.Types.ObjectId,
        ref:'offer',
     }

})
module.exports=mongoose.model('products',productSchema)
