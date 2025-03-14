import express from "express";
import  googleController  from "../controller/restApiController";
import {authMiddleware} from '../controller/authController';


const router = express.Router();

router.post("/auth/google", googleController.googleAuth);
router.get("/recommendations/:userId", authMiddleware, googleController.recommendSongs);

export default router;
