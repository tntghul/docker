import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  
    email: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    password: { type: String, select: false },
   
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
