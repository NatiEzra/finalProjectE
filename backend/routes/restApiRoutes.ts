import express from "express";
import  googleController  from "../controller/restApiController";

const router = express.Router();

router.post("/auth/google", googleController.googleAuth);

export default router;
