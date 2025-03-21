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
    userLikes:{
        type: Array,
        default: []
    },
    image:{
        type: String,
        default: ""
    },
    date:{
        type: Date,
        default: Date.now
    }
});

const postModel = mongoose.model('post', postSchema);
export default postModel;
