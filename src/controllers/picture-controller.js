import { toast } from "react-toastify";
import { updateArrayField, writeCol, writeDoc } from "../models/utils/firestore-method";
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

            toast.success("Successfully uploaded a picture!");
        } catch (error) {
            if (error.code === "STORAGE/UPLOAD_BYTES_RESUMABLE_ERROR") {
                toast.error("Failed to upload picture. Please try again!");
            }
            else {
                toast.error("Failed to write data!");
            }
        } 
    }
    static async signalPicture(picId, canSeeList) {
        try {
            canSeeList.map(async (userId) => {
                await updateArrayField("users", userId, "picturesCanSee", true, picId);
            });
        } catch (error) {
            console.log("Failed to signal to friends", error);
        }
    }

    static async loadPictures() {}
}
