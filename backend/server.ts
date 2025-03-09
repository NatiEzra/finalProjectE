import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import express, { Express } from 'express';
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';
import authRoutes from './routes/authRoutes';
import swaggerUI from "swagger-ui-express"
import swaggerJsDoc from "swagger-jsdoc"
import multer from 'multer';
import path from 'path';
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const cors = require("cors");
//app.use(cors());
app.use(cors({
  origin: "http://localhost:5173", // ✅ Allow frontend running on Vite's default port
  credentials: true, // ✅ Required to allow cookies
}));

app.use(cookieParser()); 
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/posts", postRoutes);
app.use("/comments",commentRoutes);
app.use("/auth", authRoutes);
app.use("/images", express.static("images"));




if (process.env.NODE_ENV == "development") {
 const options = {
 definition: {
 openapi: "3.0.0",
 info: {
 title: "Ofek&Nati REST API",
 version: "1.0.0",
 description: "REST server including authentication using JWT",
 },
 servers: [{url: "http://localhost:3000",},],
 },
 apis: ["./routes/*.ts"], // Update this path

 };
 const specs = swaggerJsDoc(options);
 app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
}


const mongo=mongoose.connection;
mongo.on('error', (error) => console.error(error));
mongo.once('open', () => console.log('Connected to database'));


const initApp = ()=>{
    return new Promise <Express>((resolve, reject) => {
        if(!process.env.db_connect){
            reject('Database connection string is not provided');
        }
        else {
            mongoose.connect(process.env.db_connect)
            .then(() => {
                resolve(app);
            }).catch((err) => {
                reject(err);
            });
        }
    });  
}    
export default initApp;