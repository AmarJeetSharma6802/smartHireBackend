import mongoose from "mongoose";


const SmartHireUser = mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    phone:{
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
        unique: true
    }
    ,password:{
        type: String,
        required: [true, 'Password is required'],
        trim: true,
    }
},{
    timestamps: true
}
)

export const userData = mongoose.model('userData', SmartHireUser);
    