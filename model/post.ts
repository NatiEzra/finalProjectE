import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    SenderId: {
        type: String,
        required: true
    },
    content: {
        type:  String
        },
});

const postModel = mongoose.model('post', postSchema);
export default postModel;
