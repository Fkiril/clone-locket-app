import React from "react";
import { uploadToFolder, deleteFile } from "../services/file-service";
import { writeDoc } from "../models/utils/firestore-method";
import { useUserStore } from "../hooks/user-store";
import { toast } from "react-toastify";

class UserController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null
        };
    }

    getCurrentUser() {
        const { currentUser } = useUserStore();
        this.user = currentUser;
    };

    changePassword(newPassword) {};

    async changeAvatar(newAvatar) {
        if (this.user.avatar !== "") {
            await deleteFile(this.user.avatar);
        }

        const imgUrl = await uploadToFolder(newAvatar, "avatars");
        await writeDoc("users", this.user.id, true, {
            avatar: imgUrl
        });
    };

    async deleteAvatar() {
        try {
            await deleteFile(currentUser.avatar);
            await writeDoc("users", this.user.id, true, {
                avatar: ""
            });
        } catch(error) {
            if (error.code === "STORAGE/DELETE_OBJECT_ERROR") {
                toast.warn("Failed to delete avatar. Please try again!");
            }
        }
    }

    changeUserName(newPassword) {

    };

    render() {
        return (
            <UserView />
        );
    }
}