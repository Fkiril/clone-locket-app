import { updatePassword } from "firebase/auth";

const changePassword = async (user, newPassword) => {
    try {
        await updatePassword(user, newPassword);
        console.log("Password changed successfully!");
        return true;
    } catch (error) {
        const newError = new Error("Change password's error: " + error);
        newError.code = "AUTHENTICATION/CHANGE_PASSWORD_ERROR";
        throw newError;
    }
}

export { changePassword };