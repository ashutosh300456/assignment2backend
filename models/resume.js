const mongoose = require('mongoose');
const { Schema } = mongoose;

const resumeSchema = new Schema({
    fileURL: {
        type: String,
    }
    
})

const Resume=mongoose.model('userinformation',resumeSchema);
module.exports=Resume;