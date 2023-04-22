const { Schema, model } = require('mongoose')

const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Name is required'],
        minlength: [2, 'min character is 2'],
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        required: [true, 'Email is required'],
        validate: {
            validator: function (v) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: "Please enter a valid email",
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'min character is 6'],
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
    },
    avatar: {
        data: Buffer,
        contentType: String
    },
    is_admin: {
        type: Number,
        default: 0
    },
    is_verified: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})

// create the model
const User = model("users", userSchema)
module.exports = User