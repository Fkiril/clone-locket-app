import { toast } from "react-toastify";
import { createBatchedWrites, getDocRef, updateArrayField, writeCol, writeDoc } from "../models/utils/firestore-method";
import { uploadToFolder } from "../models/utils/storage-method";

export default class PictureController {
    static async uploadPicture(picInstance, file) {
        try {
            const { fileUrl, uploadTime } = await uploadToFolder(file, "pictures");

            picInstance.url = fileUrl;
            picInstance.uploadTime = uploadTime;
            const docRefId = await writeCol("pictures", picInstance.toJSON());
            
            picInstance.id = docRefId;
            
            await writeDoc("pictures", docRefId, true, {
                id: docRefId
            });

            await this.signalPicture(picInstance.id, picInstance.canSee);
        } catch (error) {
            console.log("Error uploading picture: ", error);
            throw error;
        } 
    }
    static async signalPicture(picId, canSeeList) {
        try {
            const writes = [];
            for (const userId of canSeeList) {
                writes.push({
                    work: "update-array",
                    docRef: getDocRef("users", userId),
                    field: "picturesCanSee",
                    data: picId
                });
            }

            console.log("SignalPicture's writes: ", writes);
            await createBatchedWrites(writes);
        } catch (error) {
            console.log("Error signal picture: ", error);
            throw error;
        }
    }

    static async loadPictures() {}
}
