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
});
const commentModel = mongoose.model('comment', commentSchema);
export default commentModel;