import { auth } from "../models/services/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { writeDoc, exitDocWithValue } from "../models/utils/firestore-method";
import { toast } from "react-toastify";
import User from "../models/entities/user";

export default class AuthenticationController {
    
    static async logIn(email, password) {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            toast.error(err.message);
            console.log(err);
        }
    };

    static async logOut() {
        try {
            await signOut(auth);
        } catch (error) {
            toast.error("Something went wrong. Please try logging out again.");
            console.error(error);
        }
    }

    static async createAccount(userName, email, password, comfirmPassword) {
        // VALIDATE INPUTS
        if (!userName || !email || !password || !comfirmPassword)
            return toast.warn("Please enter inputs!");
  
        if (password !== comfirmPassword)
            return toast.warn("Passwords do not match!");
    
        // VALIDATE UNIQUE USERNAME
        if (await exitDocWithValue("users", "userName", userName)){
            return toast.warn("Username already exists!");
        }

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);

            const newUser = new User(
                res.user.uid,
                userName,
                email,
                "",
                [],
                [],
                [],
                {
                    systemTheme: "light",
                    language: "vn",
                    notificationSetting: "all"
                }
            )
            await writeDoc("users", newUser.id, false, newUser.toJSON())
      
            toast.success("Account created! You can login now!");
          } catch (err) {
            toast.error(err.message);
            console.log(err);
          }
    }
}