import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import User from "../model/user"; // Adjust this path if needed
import authController from "./authController"; // Adjust this path if needed
import exp from "constants";
import { access } from "fs";
import axios from "axios";
import dotenv from "dotenv";
import PostModel from "../model/post";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) 
      return res.status(400).json({ error: "Invalid Token" });

    const { email, name, picture } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, name, image: picture, provider: "google", refreshToken: [] });
      await user.save();
    }

    const Tokens = authController.generateToken(user._id);
    if (!Tokens) 
      return res.status(500).json({ error: "Internal Server Error" });

    if (!user.refreshToken) {
      user.refreshToken = [];
    }
    user.refreshToken.push(Tokens.refreshToken);
    await user.save();

    res.cookie("refreshToken", Tokens.refreshToken, {
      httpOnly: true,  
      secure: true,    
      sameSite: "strict", 
      path: "/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    return res.status(200).json({
      accessToken: Tokens.accessToken,
      _id: user._id,
      image: user.image,
      name: user.name,
      email: user.email
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Google Authentication Failed" });
    }
  }
};





const recommendSongs = async (req : Request, res : Response) => {
  try {
    const { id } = req.params;

    // Fetch the user's latest posts
    const userPosts = await PostModel.find({ SenderId: id }).sort({ date: -1 }).limit(5);

    if (!userPosts.length) {
      return res.json({ recommendations: [], message: "No posts found for recommendations." });
    }

    // Combine post content
    const postText = userPosts.map(post => post.title +": "+ post.content  ).join("\n");
    const promptText = `Based on these posts by the user recommend 5 songs.
    write just the song and artist name, and go down one line between the songs.
    Make sure the song really belongs to the artist,
    write the title of the song in its original language.
    do not recommend the same songs he wrote about in the posts:
     \n${postText}`;
    // Call Gemini API for recommendations
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: promptText }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Extract recommendations from API response
    const textResponse = response.data?.candidates?.[0]?.content?.parts[0]|| [];

  
    const recommendations = (textResponse.text.toString()).split("\n") || [];

    res.status(200).json({ recommendations });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(400).json({ error: "Failed to fetch recommendations" });
  }
};



export default {
    googleAuth,
    recommendSongs,
}
