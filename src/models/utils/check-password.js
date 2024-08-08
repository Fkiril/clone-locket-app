import { toast } from "react-toastify";

export const checkPassword = (password) => {
    let result = {
        length: password.length >= 6,
        uppercase: password.match(/[A-Z]/)? true : false,
        lowercase: password.match(/[a-z]/)? true : false,
        number: password.match(/\d/)? true : false,
        special: password.match(/[^A-Za-z0-9]/)? true : false,
    };

    if (!result.length) {
        toast.warning("Password must be at least 6 characters!");
        return false;
    }

    if (!result.uppercase) {
        toast.warning("Password must contain at least one uppercase letter!");
        return false;
    }

    if (!result.lowercase) {
        toast.warning("Password must contain at least one lowercase letter!");
        return false;
    }

    if (!result.number) {
        toast.warning("Password must contain at least one number!");
        return false;
    }

    if (!result.special) {
        toast.warning("Password must contain at least one special character!");
        return false;
    }

    return true;
}