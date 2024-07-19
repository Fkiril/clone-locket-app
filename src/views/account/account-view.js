import "./account-view.css";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useUserStore } from "../../hooks/user-store";
import UserController from "../../controllers/user-controllers";
import AuthenticationController from "../../controllers/authentication-controllers";

export default function AccountView() {
    const navigate = useNavigate();
    
<<<<<<< HEAD
    const { currentUser } = useUserStore();
    const userController = currentUser ? new UserController(currentUser) : null;
=======
    const { currentUser, friendsData } = useUserStore();
    const userController = currentUser? new UserController(currentUser) : null;
>>>>>>> b7e6e7a49a66aeb2fe274ad22984857cf784437d

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
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center" onClick={handleClickOutside}>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <img src={optionAvatarUrl || avatarUrl || "./default_avatar.jpg"} alt="" className="w-32 h-32 rounded-full mx-auto mb-4" />
                    <div className="flex flex-col items-center space-y-2">
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg" type="button" onClick={() => document.getElementById("file").click()}>
                            Change Avatar
                            <input
                                type="file"
                                id="file"
                                style={{ display: "none" }}
                                onChange={handleAvatar}
                            />
                        </button>
                        {optionAvatarUrl && (
                            <div className="flex space-x-2">
                                <button className="bg-green-500 text-white px-4 py-2 rounded-lg" type="button" onClick={submitOption}>
                                    Save Change
                                </button>
                                <button className="bg-red-500 text-white px-4 py-2 rounded-lg" type="button" onClick={cancelOption}>
                                    Cancel
                                </button>
                            </div>
                        )}
                        {avatarUrl && !optionAvatarUrl && (
                            <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg" type="button" onClick={() => userController.deleteAvatar()}>
                                Delete Avatar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        ), document.body);
    }

    return (
<<<<<<< HEAD
        <div className="account p-4 max-w-2xl mx-auto bg-white rounded-lg shadow-md mt-10">
            <div className="account-header mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Account</h2>
                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                    <Link to="/home">
                        Back to Home
=======
        <div className="account">
            <div className="account-header">
                <h2>Account</h2>
                <button onClick={() => document.getElementById("home").click()} >
                    <Link id="home" to="/home" >
                        Back to home page
>>>>>>> b7e6e7a49a66aeb2fe274ad22984857cf784437d
                    </Link>
                </button>
            </div>
            <div className="account-body">
                <div className="avatar mb-6 text-center">
                    <img src={optionAvatarUrl || avatarUrl || "./default_avatar.jpg"} alt="" className="w-32 h-32 rounded-full cursor-pointer mx-auto" onClick={() => setAvatarSetting(!avatarSetting)} />
                </div>
<<<<<<< HEAD
                {avatarSetting && avatarSettingPortal()}
                <div className="account-information text-center mb-6">
                    <span className="block text-xl font-semibold">{currentUser?.userName}</span>
                    <p className="text-gray-600">{currentUser?.email}</p>
                    <div className="account-stat flex justify-around mt-4">
                        <div className="stat text-center">
                            <p className="font-semibold">Pictures</p>
                        </div>
                        <div className="stat text-center">
                            <p className="font-semibold">Friends</p>
                        </div>
                        <div className="stat text-center">
                            <p className="font-semibold">Blocked</p>
                        </div>
                    </div>
                </div>
                <div className="setting text-center mb-6">
                    <button className="block w-full bg-blue-500 text-white px-4 py-2 mb-2 rounded-lg" type="button">
                        Change Nickname
=======

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
>>>>>>> b7e6e7a49a66aeb2fe274ad22984857cf784437d
                    </button>
                    <button className="block w-full bg-blue-500 text-white px-4 py-2 mb-2 rounded-lg" type="button">
                        Change Password
                    </button>
                </div>
            </div>
            <button className="w-full bg-red-500 text-white px-4 py-2 rounded-lg" onClick={handleLogOut}>
                Log Out
            </button>
        </div>
    );
}
