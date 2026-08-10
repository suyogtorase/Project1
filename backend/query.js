import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    classroomId: mongoose.Schema.Types.ObjectId,
});
const Model = mongoose.models.Test || mongoose.model('Test', schema);

const doc = new Model({ classroomId: new mongoose.Types.ObjectId() });
console.log(typeof JSON.parse(JSON.stringify(doc)).classroomId);
console.log(JSON.parse(JSON.stringify(doc)).classroomId);
