import commentModel from '../model/comment';
import { Request, Response } from "express";

const createComment = async (req:Request, res:Response) => {
    const commentBody = req.body;
    try {
        const savedComment = await commentModel.create(commentBody);
        res.status(201).send(savedComment);
    } catch (error) {
        res.status(400).send(error);
    }
}

const getAllComments= async (req:Request, res:Response) => {
    const filter= req.query.postId;
    if (filter){
        const comment=await commentModel.find({postId:filter});
        res.send(comment);
    }
    else{
    try {
        const comments = await commentModel.find();
        res.status(200).send(comments);
        } catch (error) {
        res.status(400).send(error);
        }
    }
    };

const updateComment= async (req:Request, res:Response) => {
    const {id} = req.params;
    const commentBody = req.body;
    console.log("here0"+commentBody);
    console.log("here1"+commentBody.content);
    try {
        const comment = await commentModel.findByIdAndUpdate(id,   commentBody, { new: true });
        
        if(!comment) {
            res.status(404).send('comment not found');
        }
         res.status(200).json(comment);
    }
    catch (error) {
        res.status(400);
    }
};

const deleteComment= async (req:Request, res:Response) => { 
    const { id } = req.params;
    try {
        const comment = await commentModel.findByIdAndDelete(id);
        if (!comment) {
            res.status(404).send('comment not found');
        }
         res.status(200).json(comment);
    } catch (error) {
        res.status(400).send(error);
    }
};

const getCommentById= async (req:Request, res:Response) => {
    const { id } = req.params;
    try {
    const comment = await commentModel.findById(id);
    if (comment==null) {
        res.status(404).send("comment not found");
    }
    else
    {
    res.status(200).send(comment);
    }
    } catch (error) {
        res.status(400).send(error);
    }
}
const getCommentByPostId= async (req:Request, res:Response) => {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    try {
    const comment = await commentModel.find({postId : id}).sort({ date: -1 }).skip(skip).limit(limit);
    if (comment==null) {
        res.status(404).send("comments not found");
    }
    else
    {
        res.status(200).send(comment);
    }
    }
    catch (error) {
        res.status(400).send
    }
}
export default { 
    createComment,
    getAllComments,
    updateComment,
    deleteComment,
    getCommentById,
    getCommentByPostId
 };