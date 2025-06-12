
const mongoose=require('mongoose')
// const { ref } = require('pdfkit')


const orderSchema=new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    products:[{
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'products',
        
    },
    size:{
        type:String,  
        required:true

    },
    quantity:{ 
        type:Number,
        required:true,
        default:1

    },
    productPrice: {
        type:Number,
        require:true
        
        
    },
   
    product_orderStatus:
    {
        type: String,
        enum: ['pending', 'completed', 'cancelled',"return","Shipped","Return pending","Return cancelled","Return completed","payment failed"], // Define possible payment statuses
        default: 'pending'
  

    },
    payment_method: {
        method: {
            type: String,
            enum: ['cod', 'Wallet', 'RazorPay'],
            // required: true
        }
    },
    payment_status: {
       
            type: String,
            enum: ['Failed', 'Success'],
            default:'Failed'
        
    },
    message:{
        type:String,
        default:""
    },
    
    date:{
        
        type:Date,
      default:Date.now()
    
      
    },
    cancelled_Date:{
        type:Date,
        default:""

    },
    coupon:{
     type:mongoose.Schema.Types.ObjectId,
     ref:"coupon" ,
     default:null  
    },
    cartId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'cart'
    },
    delivery:{
        type:Number,
        default:0
    }
  }],
  address:[{
    name:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    street:{
        type:String,
        required:true
    },
    pincode:{
        type:Number,
        required:true
    },
    isDefault:{
        type:Boolean,
        default:false
    }
}],
// payment_methodCOD: {
//     method: {
//         type: String,
//         enum: ['cod', 'wallet', 'razorpay'],
//         // required: true
//     }
// },
totalPrice:{
    type:Number,
    required:true
},
// order_status:{
    
//         type: String,
//         enum: ['pending', 'completed', 'cancelled'], // Define possible payment statuses
//         default: 'pending'
  
// }
Wallet:{
    type:Number,
    default:0
},




},{
    timestamps:true
})
module.exports=mongoose.model("order",orderSchema)