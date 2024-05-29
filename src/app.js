import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin:`${process.env.FRONTEND_URL}`,
    credentials:true
})); // for connection with frontend origin

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// Router Import
import userRouter from './routes/user.routes.js';
app.use("/api/v1/users", userRouter)

export default app;