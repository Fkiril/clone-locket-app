import { uploadToFolder, deleteFile } from "../models/utils/storage-method";
import { writeDoc, updateArrayField, exitDoc, getDocIdByValue, getDocByValue, getDocById } from "../models/utils/firestore-method";
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

    async unfriendById(friendId) {
        try {
            // Remove friendId from the current user's friends list
            await updateArrayField("users", this.user.id, "friends", false, friendId);
            
            // Remove current user from the friend's friends list
            await updateArrayField("users", friendId, "friends", false, this.user.id);

            toast.success("Unfriended a user!")
        } catch(error) {
            toast.error("Something went wrong. Please try again!");
            
            console.log("Error unfriending user: ", error);
        }
    }

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

    async sendFriendRequestById(receiverId) {
        try {
            if (await exitDoc("users", receiverId)) {
                await updateArrayField("users", receiverId, "friendRequests", true, this.user.id);

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

    async sendFriendRequestByEmail(receiverEmail) {
        try {
            const receiverId = await getDocIdByValue("users", "email", receiverEmail);
            if (receiverId) {
                await updateArrayField("users", receiverId, "friendRequests", true, this.user.id);

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

    async cancelFriendRequest(receiverId) {
        try {
            await updateArrayField("users", receiverId, "friendRequests", false, this.user.id);

            toast.success("Canceled a friend request!")
            return true;
        } catch (error) {
            toast.error("Something went wrong. Please try again!");

            console.error("Error canceling friend request:", error);
            return false;
        }
    }

    async acceptFriendRequest(senderId) {
        try {
            if (await exitDoc("users", senderId)) {
                await updateArrayField("users", this.user.id, "friends", true, senderId);
                await updateArrayField("users", senderId, "friends", true, this.user.id);
                await updateArrayField("users", this.user.id, "friendRequests", false, senderId);

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

    async declineFriendRequest(senderId) {
        try {
            if (await exitDoc("users", senderId)) {
                await updateArrayField("users", this.user.id, "friendRequests", false, senderId);

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

    async getUserInfo(userId) {
        try {
            const result = await getDocById("users", userId);
            if (result) {
                return result;
            } else {
                return null;
            }
        } catch (error) {
            console.log("Error getting basic user info:", error);
            return null;
        }
    }

    async getUsersInfoByIds(userIds) {
        try {
            const usersInfo = await Promise.all(userIds.map(async (id) => {
                const userInfo = await getDocById("users", id);
                return userInfo;
            }));
            return usersInfo;
        } catch (error) {
            console.log("Error getting users info:", error);
            return [];
        }
    }

    // New methods for blocking and unblocking users
    async blockUser(blockedUserId) {
        try {
            await updateArrayField("users", this.user.id, "blockedUsers", true, blockedUserId);
            toast.success("User blocked!");
        } catch (error) {
            toast.error("Something went wrong. Please try again!");
            console.error("Error blocking user:", error);
        }
    }

    async unblockUser(unblockedUserId) {
        try {
            await updateArrayField("users", this.user.id, "blockedUsers", false, unblockedUserId);
            toast.success("User unblocked!");
        } catch (error) {
            toast.error("Something went wrong. Please try again!");
            console.error("Error unblocking user:", error);
        }
    }
    
}