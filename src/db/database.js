import mongoose from "mongoose";
import { db_name } from "../constants.js";



export const dbConnection = async  () => {
    try{
        await mongoose.connect(`${process.env.MONGO_URI}/${db_name}`);
        console.log("MongoDB Connected Successfully");
    }catch(error){
        console.log("Error while connecting to DB",error);
    }
}