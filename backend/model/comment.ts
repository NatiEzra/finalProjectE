import mongoose from 'mongoose';
const commentSchema = new mongoose.Schema({
    postId: {
        type: String,
        required: true
    },
    content: {
        type:  String,
        required: true
        },
    userId: {
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    }
});
const commentModel = mongoose.model('comment', commentSchema);
export default commentModel;