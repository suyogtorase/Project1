import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    createdAt: {type: Date, default: Date.now()}
})

const adminModel = mongoose.model.admin || mongoose.model('admin', adminSchema);
export default adminModel;