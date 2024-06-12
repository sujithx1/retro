const mongoose=require('mongoose')



const categorySchema=mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true
    },
    action:{
        type:String,
        required:true

    },
    slug:{

        type:String,
        required:true


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
           type:Number,
           
         }
    
    
})
module.exports=mongoose.model('category',categorySchema)
