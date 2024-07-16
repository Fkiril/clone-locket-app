import React, { useState } from "react";
import Picture from "../models/entities/picture";
import { writeCol, writeDoc } from "../models/utils/firestore-method";
import { uploadToFolder, deleteFile } from "../models/utils/storage-method";
import { toast } from "react-toastify";

export default class PictureController {
    static async uploadPicture(pic, canSee, scope, text) {
        try {
            const { fileUrl, uploadTime } = await uploadToFolder(pic, "pictures");
            const picture = new Picture("", uploadTime, fileUrl, canSee, scope, text);
            const docRefId = await writeCol("pictures", picture.toJSON());
            
            picture.id = docRefId;
            
            await writeDoc("pictures", docRefId, true, {
                id: docRefId
            });

            console.log("uploadPicture successfully");
        } catch (error) {
            if (error.code === "STORAGE/UPLOAD_BYTES_RESUMABLE_ERROR") {
                toast.error("Failed to upload picture. Please try again!");
            }
            else {
                toast.error("Failed to write data!");
            }
            console.log(error);
        } 
    }
}