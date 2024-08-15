import { createBatchedWrites, getDocDatasByValue, getDocDataById, getDocRef, updateArrayField, writeIntoCol, writeIntoDoc } from "../models/utils/firestore-method";
import { deleteFile, uploadToFolder } from "../models/utils/storage-method";
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

    static async reactToPicture(picId, senderId, emoji) {
        try {
            await updateArrayField("pictures", picId, "reactions", true, {
                senderId: senderId,
                emoji: emoji
            });
        } catch (error) {
            console.log("Error reacting to picture: ", error);
            throw error;
        }
    }

    static async deletePicture(picId) {
        try {
            const picData = await getDocDataById("pictures", picId);
            if (!picData || !picData.url || picData.url === "") return;

            const updateWrites = [];
            if (picData.canSee && picData.canSee.length > 0) for (const userId of picData.canSee) {
                updateWrites.push({
                    work: "update-array",
                    docRef: getDocRef("users", userId),
                    field: "picturesCanSee",
                    isRemovement: true,
                    data: picId
                });
            }
            const deleteWrites = [
                {
                    work: "delete",
                    docRef: getDocRef("pictures", picId)
                }
            ]
            await Promise.all([
                createBatchedWrites(updateWrites),
                createBatchedWrites(deleteWrites),
                deleteFile(picData.url)
            ])
        } catch (error) {
            console.log("Error deleting picture: ", error);
            throw error;
        }
    }
}
