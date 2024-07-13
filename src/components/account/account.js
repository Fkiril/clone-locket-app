import "./account.css";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useUserStore } from "../../hooks/user-store";
import { auth } from "../../hooks/firebase";
import { signOut } from "firebase/auth";
import { uploadToFolder, deleteFile } from "../../models/storage-method";
import { writeDoc } from "../../models/firestore-method";

function Account(props) {
    const { setView } = props;
    const { currentUser } = useUserStore();
    console.log("currentUser's data: ", currentUser);
    
    const logOut = async () => {
        try {
            await signOut(auth);
            setView("home");
        } catch (error) {
            toast.error("Something went wrong. Please try logging out again.");
            console.error(error);
        }
    };

    const [avatar, setAvatar] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar);

    const handleAvatar = (event) => {
        if (event.target.files[0]) {
            setAvatar(event.target.files[0]);
            setAvatarUrl(URL.createObjectURL(event.target.files[0]));
          }
    };
    
    const submitAvatar = async () => {
        const imgUrl = await uploadToFolder(avatar, "avatars"); 
        console.log(imgUrl);
        setAvatarUrl(imgUrl);
        await writeDoc("users", currentUser.id, false, {
            avatar: imgUrl
        })
    }
    console.log("avatarUrl", avatarUrl);

    const deleteAvatar = async () => {
        await deleteFile(avatarUrl);
        setAvatarUrl("");
        await writeDoc("users", currentUser.id, false, {
            avatar: ""
        })
    };

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
                    <img src={avatarUrl || "./default_avatar.jpg"} alt="" />
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

                    <button typeof="button" onClick={() => submitAvatar()} >
                        Save change
                    </button>

                    <button typeof="button" onClick={() => deleteAvatar()} >
                        Delete avatar
                    </button>
                </div>
            </div>
            
            <button className="logout-button" onClick={logOut}>
                Log Out
            </button>

        </div>
    )
}

export default Account;