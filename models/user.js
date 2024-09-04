const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    number: {
        type: Number,
        required: true
    },
    pass: {
        type: String,
        required: true
    },
    fileURL: {
        type: String,
    }
});

const User = mongoose.model('User', userSchema); // Use 'User' as the collection name
module.exports = User;
