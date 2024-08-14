import { createBatchedWrites, getDocDatasByValue, getDocRef, writeIntoCol, writeIntoDoc } from "../models/utils/firestore-method";
import { uploadToFolder } from "../models/utils/storage-method";
import { stringToTimestamp } from "../models/utils/date-method";

export default class PictureController {
    static async uploadPicture(picInstance, file) {
        try {
            const { fileUrl, uploadTime } = await uploadToFolder(file, "pictures");

            picInstance.url = fileUrl;
            picInstance.uploadTime = stringToTimestamp(uploadTime);
            const docRefId = await writeIntoCol("pictures", picInstance.toJSON());
            
            picInstance.id = docRefId;
            
            await writeIntoDoc("pictures", docRefId, true, {
                id: docRefId
            });

            await this.signalNewPicture(picInstance.id, picInstance.canSee);
        } catch (error) {
            console.log("Error uploading picture: ", error);
            throw error;
        } 
    }
    static async signalNewPicture(picId, canSeeList) {
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

    static async getUserPictures(userId) {
        try {
            const userPictures = await getDocDatasByValue("pictures", "ownerId", userId, false);
            return userPictures;
        } catch (error) {
            console.log("Error get user pictures: ", error);
            throw error;
        }
    }
}
