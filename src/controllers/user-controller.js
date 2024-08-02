import { uploadToFolder, deleteFile } from "../models/utils/storage-method";
import { writeDoc, updateArrayField, getDocIdByValue, getDocDataByValue, getDocDataById, getDocRef, createBatchedWrites } from "../models/utils/firestore-method";
import { changePassword } from "../models/utils/authetication-method";

export default class UserController {
    constructor(user) {
        this.user = user;
    }

    static async getUserInfo(userId) {
        try {
            const user = await getDocDataById("users", userId);

            return user;
        } catch (error) {
            console.log("Error getting basic user info:", error);
            throw error;
        }
    }

    static async getFriendDatas(friendIds) {
        try {
            const friendDatas = await Promise.all(friendIds.map(async (id) => {
                const friendData = await getDocDataById("users", id);
                return friendData;
            }));

            return friendDatas;
        } catch(error) {
            console.log("Error getting friend datas: ", error);
            throw error;
        }
    }

    static async getRequestDatas(requestIds) {
        try {
            const requestDatas = await Promise.all(requestIds.map(async (id) => {
                const requestData = await getDocDataById("users", id);
                return requestData;
            }));

            return requestDatas;
        } catch(error) {
            console.log("Error getting request datas: ", error);
            throw error;
        }
    }

    static async getBlockedDatas(blockedIds) {
        try {
            const blockedDatas = await Promise.all(blockedIds.map(async (id) => {
                const blockedData = await getDocDataById("users", id);
                return blockedData;
            }));

            return blockedDatas;
        } catch(error) {
            console.log("Error getting blocked datas: ", error);
            throw error;
        }
    }

    static async getPictureDatas(pictureIds) {
        try {
            const pictureDatas = await Promise.all(pictureIds.map(async (id) => {
                const pictureData = await getDocDataById("pictures", id);
                return pictureData;
            }));

            return pictureDatas;
        } catch(error) {
            console.log("Error getting picture datas: ", error);
            throw error;
        }
    }

    async changePassword(user, newPassword) {
        try {
            await changePassword(user, newPassword);
        } catch(error) {
            console.log("Error changing password: ", error);
            throw error;
        }
    };

    async changeAvatar(newAvatar) {
        try {
            const { fileUrl } = await uploadToFolder(newAvatar, "avatars");
            
            if (this.user.avatar !== "") {
                await deleteFile(this.user.avatar);
            }

            await writeDoc("users", this.user.id, true, {
                avatar: fileUrl
            });
            
            this.user.avatar = fileUrl;
            return fileUrl;
        } catch(error) {
            console.log("Error changing avatar: ", error);
            throw error;
        }
    };

    async deleteAvatar() {
        try {
            await deleteFile(this.user.avatar);

            await writeDoc("users", this.user.id, true, {
                avatar: ""
            });
        } catch(error) {
            console.log("Error deleting avatar: ", error);
            throw error;
        }
    }

    async changeUserName(newUserName) {
        try {
            await writeDoc("users", this.user.id, true, {
                userName: newUserName
            });
        } catch(error) {
            console.log("Error changing user's name: ", error);
            throw error;
        }
    };

    async unfriendById(friendId) {
        try {
            const writes = [
                {
                    work: "update-array",
                    docRef: getDocRef("users", this.user.id),
                    field: "friends",
                    isRemovement: true,
                    data: friendId
                },
                {
                    work: "update-array",
                    docRef: getDocRef("users", friendId),
                    field: "friends",
                    isRemovement: true,
                    data: this.user.id
                }
            ];
            await createBatchedWrites(writes);
        } catch(error) {
            console.log("Error unfriending user: ", error);
            throw error;
        }
    }

    async getFriendByEmail(friendEmail) {
        try {
            const result = await getDocDataByValue("users", "email", friendEmail);
            if (result) {
                return result;
            } else {
                return null;
            }
        } catch (error) {
            console.log("Error getting friend:", error);
            throw error;
        }
    }

    async sendFriendRequestById(receiverId) {
        try {
            await updateArrayField("users", receiverId, "friendRequests", true, this.user.id);
        } catch (error) {
            console.error("Error sending friend request:", error);
            throw error;
        }
    }

    async sendFriendRequestByEmail(receiverEmail) {
        try {
            const receiverId = await getDocIdByValue("users", "email", receiverEmail);
            if (receiverId) {
                await updateArrayField("users", receiverId, "friendRequests", true, this.user.id);
            }
        } catch (error) {
            console.error("Error sending friend request:", error);
            throw error;
        }
    }

    async cancelFriendRequest(receiverId) {
        try {
            await updateArrayField("users", receiverId, "friendRequests", false, this.user.id);
        } catch (error) {
            console.error("Error canceling friend request:", error);
            throw error;
        }
    }

    async acceptFriendRequest(senderId) {
        try {
            const writes = [
                {
                    work: "update-array",
                    docRef: getDocRef("users", this.user.id),
                    field: "friends",
                    data: senderId
                },
                {
                    work: "update-array",
                    docRef: getDocRef("users", senderId),
                    field: "friends",
                    data: this.user.id
                },
                {
                    work: "update-array",
                    docRef: getDocRef("users", this.user.id),
                    field: "friendRequests",
                    isRemovement: true,
                    data: senderId
                }
            ];

            await createBatchedWrites(writes);
        } catch (error) {
            console.error("Error accepting friend request:", error);
            throw error;
        }
    }

    async declineFriendRequest(senderId) {
        try {
            await updateArrayField("users", this.user.id, "friendRequests", false, senderId);
        } catch (error) {
            console.error("Error declining friend request:", error);
            throw error;
        }
    }

    async getUserInfo(userId) {
        try {
            return await getDocDataById("users", userId);
        } catch (error) {
            console.log("Error getting basic user info:", error);
            throw error;
        }
    }

    async getUsersInfoByIds(userIds) {
        try {
            const usersInfo = await Promise.all(userIds.map(async (id) => {
                const userInfo = await getDocDataById("users", id);
                return userInfo;
            }));
            return usersInfo;
        } catch (error) {
            console.log("Error getting users info:", error);
            throw error;
        }
    }

    // New methods for blocking and unblocking users
    async blockUser(blockedUserId) {
        try {
            await updateArrayField("users", this.user.id, "blockedUsers", true, blockedUserId);
        } catch (error) {
            console.error("Error blocking user:", error);
            throw error;
        }
    }

    async unblockUser(unblockedUserId) {
        try {
            await updateArrayField("users", this.user.id, "blockedUsers", false, unblockedUserId);
        } catch (error) {
            console.error("Error unblocking user:", error);
            throw error;
        }
    }
    
}