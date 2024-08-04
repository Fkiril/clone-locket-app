import { auth } from "../models/services/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { exitDocWithValue, createBatchedWrites, getDocRef } from "../models/utils/firestore-method";
import { toast } from "react-toastify";
import User from "../models/entities/user";
import ChatManager from "../models/entities/chat-manager";

export default class AuthenticationController {
    
    static async logIn(email, password) {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.log("Error logging in: ", error);
            throw error;
        }
    };

    static async logOut() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error logging out: ", error);
            throw error;
        }
    }

    static async createAccount(userName, email, password, comfirmPassword) {
        // VALIDATE UNIQUE USERNAME
        if (await exitDocWithValue("users", "userName", userName)){
            return toast.warn("Username already exists!");
        }

        if (await exitDocWithValue("users", "email", email)) {
            return toast.warn("Email already exists!");
        }

        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);

            const newUser = new User({
                id: result.user.uid,
                userName: userName,
                email: email
            })

            const newChatManager = new ChatManager({
                userId: newUser.id
            })

            const writes = [
                {
                    work: "set",
                    docRef: getDocRef("users", newUser.id),
                    data: newUser.toJSON()
                },
                {
                    work: "set",
                    docRef: getDocRef("chatManagers", newUser.id),
                    data: newChatManager.toJSON()
                }
            ]

            await createBatchedWrites(writes);
          } catch (error) {
            console.log("Error creating account: ", error);
            throw error;
          }
    }
}