
import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { Document } from 'mongoose';
import userModel, { interUser } from "../model/user";



const register = async (req: Request, res: Response) => {
    const user: interUser = req.body;
    const email= req.body.email;
    const password= req.body.password;
    const salt= await bcrypt.genSalt(10);
    const name= req.body.name;
    const imagePath = req.file ? req.file.path : null; // Extract uploaded image
    var hashedPassword;
    if(password){
        hashedPassword= await bcrypt.hash(password,salt);
    }
    else{
        hashedPassword="";
    }
    const emailExists=await userModel.findOne({email:email});
    if(emailExists){
        res.status(400).send("User already exists");
        return;
    }
    try {
        const savedUser = await userModel.create({
            email: req.body.email,
            password: hashedPassword,
            image: imagePath,
            name: name
        });
        res.status(200).send(savedUser);
    } catch (error) {
        res.status(400).send(error);
    }
}

type tTokens = {
    accessToken: string,
    refreshToken: string
}
const generateToken = (userId: string): tTokens | null => {
    if (!process.env.TOKEN_SECRET) {
        return null;
    }
    // generate token
    const random = Math.random().toString();
    const accessToken = jwt.sign({
        _id: userId,
        random: random
    },
    
        process.env.TOKEN_SECRET,
        { expiresIn: process.env.TOKEN_EXPIRES });
    const refreshToken = jwt.sign({
        _id: userId,
        random: random
    },
        process.env.TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES});
    return {
        accessToken: accessToken,
        refreshToken: refreshToken
    };
};
const login = async (req: Request, res: Response) => {
    try{
    const user: interUser = req.body;
    const email= req.body.email;
    const password= req.body.password;
    const userExists=await userModel.findOne({email:email
    });
    if(!userExists){
        res.status(400).send("Username or pasword is incorrect");
        return;
    }
    else{
        const validPassword= await bcrypt.compare(password,userExists.password);
        if(!validPassword){
            res.status(400).send("Username or pasword is incorrect");
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            res.status(500).send("Server error");
            return;
        }
        const tokens=generateToken(userExists._id);
        if (!tokens) {
            res.status(500).send('Server Error');
            return;
        }
        if (!userExists.refreshToken) {
            userExists.refreshToken = [];
        }
        userExists.refreshToken.push(tokens.refreshToken);
        await userExists.save();
        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,  // Prevents JavaScript access (XSS protection)
            secure: true,    // Send only over HTTPS
            sameSite: "strict", // Prevents CSRF attacks
            path: "/", // Limits cookie to refresh route
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiration
          });
        res.status(200).send(
            {
                accessToken: tokens.accessToken,
                //refreshToken: tokens.refreshToken,
                _id: userExists._id,
                image: userExists.image,
                name: userExists.name,
                email: userExists.email
            });


        }
    

    }catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
};
type Payload = {
    _id: string,
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        res.sendStatus(401);
        return;
    }
    if (!process.env.TOKEN_SECRET) {
        res.status(500).send('Server Error');
        return;
    }
    //check if the the access token is exipred
    
    jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
        
        if (err) {
            res.status(401).send('Unauthorized');
            return;
        }
        req.params.userId = (payload as Payload)._id;
        next();
    });
}

type tUser = Document<unknown, {}, interUser> & interUser & Required<{
    _id: string;
}> & {
    __v: number;
}
const verifyRefreshToken = (refreshToken: string | undefined) => {
    return new Promise<tUser>((resolve, reject) => {
        //get refresh token from body
        if (!refreshToken) {
            reject("fail");
            return;
        }
        //verify token
        if (!process.env.TOKEN_SECRET) {
            reject("fail");
            return;
        }
        jwt.verify(refreshToken, process.env.TOKEN_SECRET, async (err: any, payload: any) => {
            if (err) {
                reject("fail");
                return
            }
            //get the user id from token
            const userId = payload._id;
            try {
                //get the user form the db
                const user = await userModel.findById(userId);
                if (!user) {
                    reject("fail");
                    return;
                }
                if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
                    user.refreshToken = [];
                    await user.save();
                    reject("fail");
                    return;
                }
                //const tokens = user.refreshToken!.filter((token) => token !== refreshToken);
                //user.refreshToken = tokens;
                
                

                resolve(user);
            } catch (err) {
                reject("fail");
                return;
            }
        });
    });
}
const logout = async (req: Request, res: Response) => {
    try {
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            res.status(400).send("fail");
            return;
        }
        user.refreshToken = [];
        await user.save();
        res.clearCookie("refreshToken", {});

        res.status(200).send("success");
    } catch (err) {
        res.status(400).send("fail");
    }
}
const refresh = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(400).send("fail");
            return;
        }
        const user = await verifyRefreshToken(refreshToken);
        if (!user) {
            res.status(400).send("fail");
            return;
        }
        const tokens = generateToken(user._id);
        if (!tokens) {
            res.status(500).send('Server Error');
            return;
        }
        if (!user.refreshToken) {
            user.refreshToken = [];
        }
        //check if token is already in array
        if (!user.refreshToken.includes(tokens.refreshToken)) {
            user.refreshToken.push(tokens.refreshToken);
        }

        await user.save();
        res.status(200).send(
            {
                accessToken: tokens.accessToken,
                //refreshToken: tokens.refreshToken,
                _id: user._id
            });
        //send new token
    } catch (err) {
        res.status(400).send("fail");
    }
}

const edit = async (req: Request, res: Response) => {
    try {
        const user = await userModel.findById(req.body._id);
        const username= req.body.username;
        if(username==""){
            res.status(400).send("fail");
            return;
        }
        if (!user) {
            res.status(400).send("fail");
            return;
        }
        var refreshToken=req.body.refreshToken;
        if (await verifyRefreshToken(refreshToken)){
            //user.set(req.body);
            user.image=req.body.image;
            user.name=req.body.name;
             await user.save();
            res.status(200).send(user);
        }
        
        
    } catch (err) {
        res.status(400).send("fail");
    }
}

const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await userModel.find();
        res.status(200).send(users);
    } catch (err) {
        res.status(400).send("fail");
    }
}
export default  {
    register,
    login,
    refresh,
    logout,
    edit,
    getUsers,
};
