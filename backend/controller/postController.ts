import { Request, Response } from "express";
import PostModel from '../model/post';
import postModel from "../model/post";

const createPost = async (req:Request, res:Response) => {
    
    const imagePath = req.file ? req.file.path : null; // Extract uploaded image
    const postBody = req.body;
    postBody.image = imagePath;
    try {
    const post = await PostModel.create(postBody);
    res.status(201).send(post);
    } catch (error) {
        res.status(400).send(error);
    }
};

const getAllPosts= async (req:Request, res:Response) => {
    const  filter  = req.query.SenderId; // Get SenderId from query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    if (filter) {
        // If SenderId is provided, filter posts by SenderId
        const posts = await PostModel.find({SenderId: filter }).sort({ date: -1 }).skip(skip).limit(limit);
         res.send(posts);

    }
    else{
    try {
       
        const posts = await PostModel.find()
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);
        const totalPosts = await PostModel.countDocuments(); // Total posts count
        res.status(200).send(posts);
    } catch (error) {
        res.status(400).send(error);
    }
}
};

const getPostById= async (req:Request, res:Response) => {
    const { id } = req.params;
    try {
    const post = await PostModel.findById(id);
    if (post==null) {
        res.status(404).send("Post not found");
    }
    else
    {
    res.status(200).send(post);
    }
    } catch (error) {
        res.status(400).send(error);
    }
};

const updatePost = async (req:Request, res:Response) => { 
    const { id } = req.params; // מקבל את ה-ID מהנתיב
    var newPost = req.body;
    if(req.file)
    newPost.image= req.file.path;
    try {
        // מחפש את הפוסט ומעדכן אותו עם הנתונים מ-body
        const updatedPost = await PostModel.findByIdAndUpdate(
            id, // מזהה הפוסט לעדכון
            newPost, // הנתונים החדשים
            { new: true } // מחזיר את המסמך המעודכן
        );

        // אם הפוסט לא נמצא
        if (!updatedPost) {
             res.status(404).send('Post not found');
        }

        // מחזיר את הפוסט המעודכן
         res.status(200).json(updatedPost);
    } catch (error) {
        // מחזיר שגיאה אם יש בעיה
        res.status(400).send(error);
    }
};


const deletePost= async (req:Request, res:Response) => { 
    const { id } = req.params;
    try {
        const post = await postModel.findByIdAndDelete(id);
        if (!post) {
            res.status(404).send('post not found');
        }
         res.status(200).json(post);
    } catch (error) {
        res.status(400).send(error);
    }
};
const likePost = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.params.userId;
    var flag = false;

    try {
        const post = await postModel.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        for (let i = 0; i < post.userLikes.length; i++) {
            if (post.userLikes[i] == userId) {
                return res.status(400).json({ message: "User already liked this post" });
            }
        }

        post.userLikes.push(userId);
        await post.save();
        return res.status(200).json({ message: "Post liked successfully", post });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error });
    }
};

const unlikePost = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.params.userId;

    try {
        const post = await postModel.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const index = post.userLikes.indexOf(userId);
        if (index === -1) {
            return res.status(400).json({ message: "User has not liked this post" });
        }

        post.userLikes.splice(index, 1);
        await post.save();
        return res.status(200).json({ message: "Post unliked successfully", post });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error });
    }
};


 export default {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    
};