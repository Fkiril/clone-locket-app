import "./account-view.css";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useUserStore } from "../../hooks/user-store";
import UserController from "../../controllers/user-controller";
import AuthenticationController from "../../controllers/authentication-controller";

export default function AccountView() {
    const navigate = useNavigate();
    
    const { currentUser, friendsData } = useUserStore();
    const userController = currentUser? new UserController(currentUser) : null;

    const [avatarSetting, setAvatarSetting] = useState(false);
    const [optionAvatar, setOptionAvatar] = useState(null);
    const [optionAvatarUrl, setOptionAvatarUrl] = useState("");
    const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar);

    const [friendId, setFriendId] = useState("");
    const [friendEmail, setFriendEmail] = useState("");

    const handleAvatar = (event) => {
        if (event.target.files[0]) {
            setOptionAvatar(event.target.files[0]);
            setOptionAvatarUrl(URL.createObjectURL(event.target.files[0]));
          }
    };
    const submitOption = async () => {
        const imgUrl = await userController.changeAvatar(optionAvatar);
        setAvatarUrl(imgUrl);
        setOptionAvatarUrl("");
    }
    const cancelOption = () => {
        const fileInput = document.getElementById("file");
        fileInput.value = "";
        setOptionAvatar(null);
        setOptionAvatarUrl("");
    }

    const handleLogOut = async () => {
        await AuthenticationController.logOut();
        navigate("/");
    }

    const avatarSettingPortal = () => {
        const handleClickOutside = (event) => {
            const clickElement = event.target;
            if (!(clickElement.closest(".body img") || clickElement.closest(".body .setting-button"))) {
                setAvatarSetting(false);
            }
        }

        return createPortal((
            <div className="avatar-setting" onClick={handleClickOutside}>
                <div className="body">
                    <img src={optionAvatarUrl || avatarUrl || "./default_avatar.jpg"} alt="" />
                    <div className="setting-button">
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
                                    Cancel option
                                </button>
                            </div>
                        ) : (
                            null
                        )}

                        { (avatarUrl !== "" && optionAvatarUrl === "") ? (
                            <button typeof="button" onClick={() => userController.deleteAvatar()} >
                                Delete avatar
                            </button>
                        ) : (
                            null
                        )}
                    </div>
                </div>
            </div>
        ), document.body)
    }

    return (
        <div className="account">
            <div className="account-header">
                <h2>Account</h2>
                <button onClick={() => document.getElementById("home").click()} >
                    <Link id="home" to="/home" >
                        Back to home page
                    </Link>
                </button>
            </div>

            <div className="account-body">
                <div className="avatar" >
                    <img src={(optionAvatarUrl ? optionAvatarUrl : avatarUrl ) || "./default_avatar.jpg"} alt="" onClick={() => setAvatarSetting(!avatarSetting)} />
                </div>

                { avatarSetting && avatarSettingPortal()}

                <div className="account-information">
                    <span>{currentUser?.userName}</span>
                    <p>{currentUser?.email}</p>
                    <div className="account-stat">
                        <div className="pictures">
                            <p>Pictures</p>
                        </div>
                        <div className="friends">
                            <p>Friends: </p>
                            { friendsData.map((friend) => (
                                <div key={friend.id} className="friend">
                                    <img src={friend.avatar} alt=""></img>
                                    <p>{friend.name}</p>
                                </div>
                            )) }
                        </div>
                        <div className="blocked">
                            <p>Blocked</p>
                        </div>
                    </div>
                </div>
                
                <div className="add-friend-by-id">
                    <input type="text" placeholder="Add friend by id" onChange={(e) => setFriendId(e.target.value)} />
                    <button onClick={() => userController.addFriendById(friendId)}>
                        Add
                    </button>
                </div>
                <div className="add-friend-by-email">
                    <input type="text" placeholder="Add friend by email" onChange={(e) => setFriendEmail(e.target.value)} />
                    <button onClick={() => userController.addFriendByEmail(friendEmail)}>
                        Add
                    </button>
                </div>

                <div className="setting">
                    <button typeof="button" >
                        Change nickname
                    </button>
                    <button typeof="button" >
                        Change password
                    </button>
                </div>
            </div>
            
            <button className="logout-button" onClick={handleLogOut}>
                Log Out
            </button>
        </div>
    );
}