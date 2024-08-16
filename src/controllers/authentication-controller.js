import { auth, googleProvider } from "../models/services/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup, deleteUser, applyActionCode } from "firebase/auth";
import { exitDocWithValue, createBatchedWrites, getDocRef, exitDoc, getDocDataById } from "../models/utils/firestore-method";
import { deleteFile } from "../models/utils/storage-method";
import { toast } from "react-toastify";
import User from "../models/entities/user";
import ChatManager from "../models/entities/chat-manager";
import PictureController from "../controllers/picture-controller";

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
            googleProvider.setCustomParameters({
                prompt: 'select_account',
                display: 'popup'
            });
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

    static async sendEmailVerification(user) {
        try {
            await sendEmailVerification(user);
        } catch (error) {
            console.log("Error sending email verification: ", error);
            throw error;
        }
    }

    static async applyActionCodeFromURL(url) {
        const oobCode = new URL(url).searchParams.get('oobCode');
        console.log("oobCode: ", oobCode);
        if (!oobCode) {
            console.log("Invalid action code: ", oobCode);
            return;
        }
        try {
            await applyActionCode(auth, oobCode);
        } catch (error) {
            console.log("Error applying action code: ", error);
            throw error;
        }
    }

    static async sendPasswordResetEmail (email) {
        try {
            if (!(await exitDocWithValue("users", "email", email))) {
                toast.warning("Email does not exist in the system!");
                return false;
            }
            await sendPasswordResetEmail(auth, email);
            return true;
        } catch (error) {
            console.log("Error sending password reset email: ", error);
            throw error;
        }
    }

    static async deleteAccount(props) {
        try {
            if (!props.userId || props.userId === "") {
                console.log("Invalid props: ", props);
                return false;
            }

            const userData = await getDocDataById("users", props.userId);
            const chatManagerData = await getDocDataById("chatManagers", props.userId);
            const userPictures = await PictureController.getUserPictures(props.userId);
            console.log("userData: ", userData);
            console.log("chatManagerData: ", chatManagerData);
            console.log("userPictures: ", userPictures);
            
            const deleteWrites = [
                {
                    work: "delete",
                    docRef: getDocRef("users", props.userId)
                },
                {
                    work: "delete",
                    docRef: getDocRef("chatManagers", props.userId)
                }
            ];
            if (chatManagerData && chatManagerData.conversationStates && Object.keys(chatManagerData.conversationStates).length > 0) {
                for (const conversationId of Object.keys(chatManagerData.conversationStates)) {
                    deleteWrites.push({
                        work: "delete",
                        docRef: getDocRef("conversations", conversationId)
                    });
                }
            }

            if (props.avatar !== "" && props.avatar.match("firebasestorage")) await deleteFile(props.avatar);

            const updateWrites = [];
            if (userData && userData.friends && userData.friends.length > 0) {
                for (const friendId of userData.friends) {
                    updateWrites.push({
                        work: "update-array",
                        docRef: getDocRef("users", friendId),
                        field: "friends",
                        isRemovement: true,
                        data: props.userId
                    });
                }
            }
            if (userPictures && userPictures.length > 0) {
                for (const pic of userPictures) {
                    await deleteFile(pic.url);

                    deleteWrites.push({
                        work: "delete",
                        docRef: getDocRef("pictures", pic.id)
                    })
                    if (pic.canSee && pic.canSee.length > 0) {
                        for (const id of pic.canSee) {
                            if (id === props.userId) continue;
                            updateWrites.push({
                                work: "update-array",
                                docRef: getDocRef("users", id),
                                field: "pictures",
                                isRemovement: true,
                                data: pic.id
                            });
                        }
                    }
                }
            }

            await createBatchedWrites(updateWrites).then(async () => {
                console.log("Updated user info.");
                await createBatchedWrites(deleteWrites).then(async() => {
                    console.log("Deleted user info.");
                    await deleteUser(auth?.currentUser);
                });
            });
        } catch (error) {
            console.log("Error deleting account: ", error);
            throw error;
        }
    }
}