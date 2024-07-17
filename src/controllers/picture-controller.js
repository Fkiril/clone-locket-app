import React, { useState } from "react";
import Picture from "../models/entities/picture";
import { writeCol, writeDoc, updateArrayField } from "../models/utils/firestore-method";
import { uploadToFolder } from "../models/utils/storage-method";
import { toast } from "react-toastify";

export default class PictureController {
    static async uploadPicture(picInstance, file) {
        console.log("uploadPicture", picInstance, file);
        try {
            const { fileUrl, uploadTime } = await uploadToFolder(file, "pictures");
            picInstance.url = fileUrl;
            picInstance.uploadTime = uploadTime;
            const docRefId = await writeCol("pictures", picInstance.toJSON());
            
            picInstance.id = docRefId;
            
            await writeDoc("pictures", docRefId, true, {
                id: docRefId
            });

            await updateArrayField("users", picInstance.ownerId, "picturesCanSee", docRefId);

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
    static async signalToFriends() {}

    static async loadPictures() {}
}