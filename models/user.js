const mongoose = require('mongoose');
const { float } = require('webidl-conversions');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
         
    },
    address: {
        type: String,
        
        
    },
    age:{
     type:Number,
    
    },
    email:{
     type:String,
     
    },
    number: {
        type: Number,
        // required:true
    },
    pass:{
        type:String,
    },
    fileURL: {
        type: String,
    }
    
});

const User=mongoose.model('resume',userSchema);
User.createIndexes();  
module.exports=User;