import "./account.css";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useUserStore } from "../../hooks/user-store";
import { auth } from "../../models/services/firebase";
import { signOut } from "firebase/auth";
import { uploadToFolder, deleteFile } from "../../models/storage-method";
import { writeDoc } from "../../models/utils/firestore-method";

function Account(props) {
    const { setView } = props;
    const { currentUser } = useUserStore();
    
    const [optionAvatar, setOptionAvatar] = useState(null);
    const [optionAvatarUrl, setOptionAvatarUrl] = useState("");
    const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar);
    
    const logOut = async () => {
        try {
            await signOut(auth);
            setView("home");
        } catch (error) {
            toast.error("Something went wrong. Please try logging out again.");
            console.error(error);
        }
    };

    const handleAvatar = (event) => {
        if (event.target.files[0]) {
            setOptionAvatar(event.target.files[0]);
            setOptionAvatarUrl(URL.createObjectURL(event.target.files[0]));
          }
    };
    
    const submitOption = async () => {
        if (avatarUrl !== "") {
            await deleteFile(avatarUrl);
        }

        const imgUrl = await uploadToFolder(optionAvatar, "avatars"); 
        console.log(imgUrl);
        await writeDoc("users", currentUser.id, false, {
            avatar: imgUrl
        })
        
        setAvatarUrl(imgUrl);
        setOptionAvatarUrl("");
    }

    const cancelOption = () => {
        const fileInput = document.getElementById("file");
        fileInput.value = "";
        
        setOptionAvatar(null);
        setOptionAvatarUrl("");
    }

    const deleteAvatar = async () => {
        await deleteFile(avatarUrl);
        await writeDoc("users", currentUser.id, false, {
            avatar: ""
        })

        setAvatarUrl("");
    };

    console.log("User's data: ", currentUser);
    console.log("avatarUrl: ", avatarUrl);
    console.log("optionAvatarUrl: ", optionAvatarUrl);

    return (
        <div className="account">
            <div className="account-header">
                <h2>Account</h2>
                <button className="back-button" onClick={() => setView("home")} >
                    Back to home page
                </button>
            </div>

            <div>
                Hello {currentUser.email}
            </div>
            <div className="avatar" >
                <div className="avatar-circle" >
                    <img src={(optionAvatarUrl ? optionAvatarUrl : avatarUrl ) || "./default_avatar.jpg"} alt="" />
                </div>
                
                <div className="avatar-button">
                    <button typeof="button" onClick={() => document.getElementById("file").click()}>
                            Change Avatar
                            <input
                                type="file"
                                id="file"
                                style={{ display: "none" }}
                                onChange={handleAvatar}
                            />
                    </button>
                    { optionAvatarUrl ? (
                        <div>
                            <button typeof="button" onClick={() => submitOption()} >
                                Save change
                            </button>
                            <button typeof="button" onClick={() => cancelOption()} >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        null
                    )}

                    { avatarUrl ? (
                        <button typeof="button" onClick={() => deleteAvatar()} >
                            Delete avatar
                        </button>
                    ) : (
                        null
                    )}
                </div>
            </div>
            
            <button className="logout-button" onClick={logOut}>
                Log Out
            </button>

        </div>
    )
}

export default Account;