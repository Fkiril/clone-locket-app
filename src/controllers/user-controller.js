import { uploadToFolder, deleteFile } from "../models/utils/storage-method";
import { writeDoc, updateArrayField, exitDoc, getDocIdByValue, getDocByValue } from "../models/utils/firestore-method";
import { changePassword } from "../models/utils/authetication-method";
import { toast } from "react-toastify";

export default class UserController {
    constructor(user) {
        this.user = user;
    }

    async changePassword(user, newPassword) {
        try {
            await changePassword(user, newPassword);

            toast.success("Changed your password!");
        } catch(error) {
            toast.error("Something went wrong. Please try again!");

            console.log("Error changing password: ", error);
        }
    };

    async changeAvatar(newAvatar) {
        try {
            if (this.user.avatar !== "") {
                await deleteFile(this.user.avatar);
            }
    
            const { fileUrl } = await uploadToFolder(newAvatar, "avatars");
            await writeDoc("users", this.user.id, true, {
                avatar: fileUrl
            });
            this.user.avatar = fileUrl;

            toast.success("Changed your avatar!");
            return fileUrl;
        } catch(error) {
            if (error.code === "STORAGE/DELETE_OBJECT_ERROR") {
                toast.error("Failed to delete avatar. Please try again!");
            }
            else if (error.code === "STORAGE/UPLOAD_BYTES_RESUMABLE_ERROR") {
                toast.error("Failed to upload avatar. Please try again!");
            }
            else {
                toast.error("Something went wrong. Please try again!");
            }
            console.log("Error changing avatar: ", error);
        }
    };

    async deleteAvatar() {
        try {
            await deleteFile(this.user.avatar);
            await writeDoc("users", this.user.id, true, {
                avatar: ""
            });

            toast.success("Deleted your avatar!");
        } catch(error) {
            if (error.code === "STORAGE/DELETE_OBJECT_ERROR") {
                toast.error("Failed to delete avatar. Please try again!");
            }
            else {
                toast.error("Something went wrong. Please try again!");
            }
            console.log("Error deleting avatar: ", error);
        }
    }

    async changeUserName(newUserName) {
        try {
            await writeDoc("users", this.user.id, true, {
                userName: newUserName
            });

            toast.success("Changed your user's name!")
        } catch(error) {
            toast.error("Something went wrong. Please try again!");

            console.log("Error changing user's name: ", error);
        }
    };

    async getFriendByEmail(friendEmail) {
        try {
            const result = await getDocByValue("users", "email", friendEmail);
            if (result) {
                return result;
            } else {
                toast.warning("Invalid email!");
                return null;
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again!");

            console.log("Error getting friend:", error);
            return null;
        }
    }

    async sendFriendRequestById(senderId, receiverId) {
        try {
            if (await exitDoc("users", receiverId)) {
                await updateArrayField("users", receiverId, "friendRequests", true, senderId);

                toast.success("Sended a friend request!")
                return true;
            }
            else {
                toast.warning("Invalid ID!");
                return false;
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again!");

            console.error("Error sending friend request:", error);
            return false;
        }
    }

    async sendFriendRequestByEmail(senderId, receiverEmail) {
        try {
            const receiverId = await getDocIdByValue("users", "email", receiverEmail);
            if (receiverId) {
                await updateArrayField("users", receiverId, "friendRequests", true, senderId);

                toast.success("Sended a friend request!")
                return true;
            } else {
                toast.warning("Invalid email!");
                return false;
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again!");

            console.error("Error sending friend request:", error);
            return false;
        }
    }

    async acceptFriendRequest(receiverId, senderId) {
        try {
            if (await exitDoc("users", senderId)) {
                await updateArrayField("users", receiverId, "friends", true, senderId);
                await updateArrayField("users", senderId, "friends", true, receiverId);
                await updateArrayField("users", receiverId, "friendRequests", false, senderId);

                toast.success("Accepted a friend request!");
                return true;
            }
            else {
                toast.warning("Invalid ID!");
                return false;
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again!");

            console.error("Error accepting friend request:", error);
            return false;
        }
    }

    async declineFriendRequest(receiverId, senderId) {
        try {
            if (await exitDoc("users", senderId)) {
                await updateArrayField("users", receiverId, "friendRequests", false, senderId);

                toast.success("Declined a friend request!")
                return true;
            }
            else {
                toast.warning("Invalid ID!");
                return false;
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again!");

            console.error("Error declining friend request:", error);
            return false;
        }
    }
}