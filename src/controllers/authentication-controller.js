import { auth, facebookProvider, googleProvider } from "../models/services/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, confirmPasswordReset } from "firebase/auth";
import { exitDocWithValue, createBatchedWrites, getDocRef, exitDoc } from "../models/utils/firestore-method";
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

    static async createAccountWithEmailAndPassword(userName, email, password) {
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

    static async createAccount(props) {
        if (!props || !props.id || !props.name || !props.email || !props.avatar) {
            return;
        }
        try {
            const newUser = new User({
                id: props.id,
                userName: props.name,
                email: props.email,
                avatar: props.avatar
            })

            const newChatManager = new ChatManager({
                userId: props.id
            })

            const writes = [
                {
                    work: "set",
                    docRef: getDocRef("users", props.id),
                    data: newUser.toJSON()
                },
                {
                    work: "set",
                    docRef: getDocRef("chatManagers", props.id),
                    data: newChatManager.toJSON()
                }
            ];

            await createBatchedWrites(writes);
        } catch (error) {
            console.log("Error creating account: ", error);
            throw error;
        }
    }

    static async signInWithGoogle() {
        try {
            googleProvider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup(auth, googleProvider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;

            if (!(await exitDoc("users", user.uid))) {
                console.log("Create account: ", user.displayName, user.uid, user.email, user.photoURL);
                await AuthenticationController.createAccount({
                    id: user.uid,
                    name: user.displayName,
                    email: user.email,
                    avatar: user.photoURL
                });

                return {
                    user: user,
                    token: token,
                    credential: credential,
                    isNewUser: true
                }
            }

            return {
                user: user,
                token: token,
                credential: credential
            }
        } catch (error) {
            console.log("Error signing in with Google: ", error);
            throw error;
        }
    }

    static async signInWithFacebook() {
        try {
            facebookProvider.setCustomParameters({
                prompt: 'select_account',
                display: 'popup'
            });
            const result = await signInWithPopup(auth, facebookProvider);
            const credential = FacebookAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;

            if (!(await exitDoc("users", user.uid))) {
                console.log("Create account: ", user.displayName, user.uid, user.email, user.photoURL);
                await AuthenticationController.createAccount({
                    id: user.uid,
                    name: user.displayName,
                    email: user.email,
                    avatar: user.photoURL
                });

                return {
                    user: user,
                    token: token,
                    credential: credential,
                    isNewUser: true
                }
            }

            return {
                user: user,
                token: token,
                credential: credential
            }
        } catch (error) {
            console.log("Error signing in with Facebook: ", error);
            throw error;
        }
    }

    static async sendEmailVerification(user) {
        try {
            await sendEmailVerification(user);
        } catch (error) {
            console.log("Error sending email verification: ", error);
            throw error;
        }
    }

    static async sendPasswordResetEmail (email) {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.log("Error sending password reset email: ", error);
            throw error;
        }
    }

    static async confirmPasswordReset(code, password) {
        try {
            await confirmPasswordReset(auth, code, password);
        } catch (error) {
            console.log("Error confirming password reset: ", error);
            throw error;
        }
    }
}