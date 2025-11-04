const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    mobileno: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    otp: {
        type: Number,
    },
    photo: {
        type: String,
    },
    gender: {
        type: String,
    },
    lastname: {
        type: String,
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    refreshToken:{
        type:String
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('user', userSchema)