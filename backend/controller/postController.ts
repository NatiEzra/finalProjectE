import { Request, Response } from "express";
import PostModel from '../model/post';
import postModel from "../model/post";

const createPost = async (req:Request, res:Response) => {
    const postBody = req.body;
    try {
    const post = await PostModel.create(postBody);
    res.status(201).send(post);
    } catch (error) {
        res.status(400).send(error);
    }
};

const getAllPosts= async (req:Request, res:Response) => {
    const  filter  = req.query.SenderId; // Get SenderId from query parameters
    if (filter) {
        // If SenderId is provided, filter posts by SenderId
        const posts = await PostModel.find({SenderId: filter });
         res.send(posts);
    }
    else{
    try {
    const posts = await PostModel.find();
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
    
    try {
        // מחפש את הפוסט ומעדכן אותו עם הנתונים מ-body
        const updatedPost = await PostModel.findByIdAndUpdate(
            id, // מזהה הפוסט לעדכון
            req.body, // הנתונים החדשים
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

 export default {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost
    
};