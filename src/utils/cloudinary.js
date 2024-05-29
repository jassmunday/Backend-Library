import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
        
cloudinary.config({ 
  cloud_name: 'dszmtu2yj', 
  api_key: '963154858821443', 
  api_secret: 'cAzcYBrwA8ZHnzGnnlvKL5lc5hg' 
});

const fileUploadOnCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log(response.url);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.log(error);
        return null;
    }
  
}
export {fileUploadOnCloudinary};