import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";


dotenv.config({
    src : "../.env"
})



cloudinary.config({
  cloud_name: 'dqes4jlnf',
  api_key: '189267991227771',
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const cloudinaryUpload = async (localFilePath)=>{

    try {
        if(!localFilePath){
            return null;
        } 
        //uploading file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type : "auto",
        })
        //console.log(response);
        
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
    
}

export {cloudinaryUpload}