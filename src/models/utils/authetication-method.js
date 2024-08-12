import { updatePassword } from "firebase/auth";
import { auth } from "../services/firebase";

const changePassword = async (newPassword) => {
    try {
        await updatePassword(auth.currentUser, newPassword);
        console.log("Password changed successfully!");
        return true;
    } catch (error) {
        const newError = new Error("Change password's error: " + error);
        newError.code = "AUTHENTICATION/CHANGE_PASSWORD_ERROR";
        throw newError;
    }
}

export { changePassword };