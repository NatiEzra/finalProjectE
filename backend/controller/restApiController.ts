import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import User from "../model/user"; // Adjust this path if needed
import authController from "./authController"; // Adjust this path if needed
import exp from "constants";
import { access } from "fs";

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
      user = new User({ email, name, image: picture, provider: "google" });
      await user.save();
    }

    const Tokens = authController.generateToken(user._id);
    if (!Tokens) 
      return res.status(500).json({ error: "Internal Server Error" });
    const accessToken=Tokens.accessToken;
    res.json({ accessToken, user });
    if (!user.refreshToken){
      user.refreshToken = [];
    }
    user.refreshToken.push(Tokens.refreshToken);
    await user.save();
  } catch (error) {
    res.status(500).json({ error: "Google Authentication Failed" });
  }
};
export default {
    googleAuth,
}
