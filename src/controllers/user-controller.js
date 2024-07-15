import { uploadToFolder, deleteFile } from "../models/utils/storage-method";
import { writeDoc } from "../models/utils/firestore-method";
import { toast } from "react-toastify";

export default class UserController {
    constructor(user) {
        this.user = user;
    }

    async changePassword(newPassword) {
        try {
            await writeDoc("users", this.user.id, true, {
                password: newPassword
            });
        } catch(error) {
            toast.error("Something went wrong. Please try again!");
        }
    };

    async changeAvatar(newAvatar) {
        try {
            if (this.user.avatar !== "") {
                await deleteFile(this.user.avatar);
            }
    
            const imgUrl = await uploadToFolder(newAvatar, "avatars");
            await writeDoc("users", this.user.id, true, {
                avatar: imgUrl
            });
            this.user.avatar = imgUrl;
            return imgUrl;
        } catch(error) {
            if (error.code === "STORAGE/DELETE_OBJECT_ERROR") {
                toast.error("Failed to delete avatar. Please try again!");
            }
            else if (error.code === "STORAGE/UPLOAD_BYTES_RESUMABLE_ERROR") {
                toast.error("Failed to upload avatar. Please try again!");
            }
            else {
                toast.error("Something went wrong. Please try again!");
                console.log(error);
            }
        }
    };

    async deleteAvatar() {
        try {
            await deleteFile(this.user.avatar);
            await writeDoc("users", this.user.id, true, {
                avatar: ""
            });
        } catch(error) {
            if (error.code === "STORAGE/DELETE_OBJECT_ERROR") {
                toast.error("Failed to delete avatar. Please try again!");
            }
            else {
                toast.error("Something went wrong. Please try again!");
            }
        }
    }

    async changeUserName(newUserName) {
        try {
            await writeDoc("users", this.user.id, true, {
                userName: newUserName
            })
        } catch(error) {
            toast.error("Something went wrong. Please try again!");
        }
    };
}