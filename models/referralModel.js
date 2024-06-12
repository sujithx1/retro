const mongoose=require('mongoose')
const referalSchema=mongoose.Schema({
    
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },

    
    email:{
        type:String,
        required:true
    },
    reffered:{
        type:Boolean,
        default:false
    }


})
module.exports=mongoose.model('referal',referalSchema)