import { uploadToFolder, deleteFile } from "../models/utils/storage-method";
import { writeDoc, updateArrayField, exitDoc, getDocIdByValue, getDocByValue } from "../models/utils/firestore-method";
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
    
            const { fileUrl } = await uploadToFolder(newAvatar, "avatars");
            await writeDoc("users", this.user.id, true, {
                avatar: fileUrl
            });
            this.user.avatar = fileUrl;
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

    async addFriendById(friendId) {
        try {
            if (await exitDoc("users", friendId)) {
                await updateArrayField("users", this.user.id, "friends", true, friendId);

                toast.success("Friend added successfully!");
                return true;
            } else {
                toast.error("Friend does not exist. Please try again!");
                return false;
            }
        } catch(error) {
            toast.error("Something went wrong. Please try again!");
        }
    }

    async addFriendByEmail(friendEmail) {
        try {
            const friendId = await getDocIdByValue("users", "email", friendEmail);
            if (friendId) {
                await updateArrayField("users", this.user.id, "friends", true, friendId);

                toast.success("Friend added successfully!");
                return true;
            } else {
                toast.error("Friend does not exist. Please try again!");
                return false;
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again!");
            return false;
        }
    }

    async getFriendByEmail(friendEmail) {
        try {
            const result = await getDocByValue("users", "email", friendEmail);
            if (result) {
                toast.success("Friend found successfully!");
                return result;
            } else {
                toast.warning("Friend does not exist. Please try again!");
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

                toast.success("Friend request sent successfully!");
                return true;
            }
            else {
                toast.warning("Friend does not exist. Please try again!");
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

                toast.success("Friend request sent successfully!");
                return true;
            } else {
                toast.warning("Friend does not exist. Please try again!");
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

                toast.success("Friend request accepted successfully!");
                return true;
            }
            else {
                toast.warning("Friend does not exist. Please try again!");
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

                toast.success("Friend request declined successfully!");
                return true;
            }
            else {
                toast.warning("Friend does not exist. Please try again!");
                return false;
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again!");

            console.error("Error declining friend request:", error);
            return false;
        }
    }
}