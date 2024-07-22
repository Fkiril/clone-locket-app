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
    const userController = currentUser ? new UserController(currentUser) : null;

    const [avatarSetting, setAvatarSetting] = useState(false);
    const [optionAvatar, setOptionAvatar] = useState(null);
    const [optionAvatarUrl, setOptionAvatarUrl] = useState("");
    const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar);

    const [isSearching, setIsSearching] = useState(false);
    const [searchEmail, setSearchEmail] = useState("");
    const [searchResult, setSearchResult] = useState(null);

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
            if (!(clickElement.closest(".avatar-setting .body"))) {
                setAvatarSetting(false);
            }
        }

        return createPortal((
            <div className="avatar-setting fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center" onClick={handleClickOutside}>
                <div className="body bg-white p-6 rounded-lg shadow-lg">
                    <img src={optionAvatarUrl? optionAvatarUrl : avatarUrl} alt="" className="w-32 h-32 rounded-full mx-auto mb-4" />
                    <div className="flex flex-col items-center space-y-2">
                        <button 
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                            type="button" 
                            onClick={() => document.getElementById("file").click()}>
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
                            <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
                                    type="button" 
                                    onClick={async () => await userController.deleteAvatar()}>
                                Delete Avatar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        ), document.body);
    }

    const searchFriendByEmailPortal = () => {
        const handleSearch = async () => {
            const result = await userController.getFriendByEmail(searchEmail);
            setSearchResult(result);
        }

        const handleSendFriendRequest = async () => {
            userController.sendFriendRequestById(currentUser.id, searchResult.id);
            setSearchResult(null);
        }

        const handleClickOutside = (event) => {
            const clickElement = event.target;
            if (!(clickElement.closest(".search-friend-by-email .body"))) {
                setIsSearching(false);
            }
        }
    
        return createPortal((
            <div className="search-friend-by-email fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center" onClick={handleClickOutside}>
                <div className="body bg-white p-6 rounded-lg shadow-lg">
                    <input 
                        type="email" 
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        placeholder="Enter friend's email"
                        className="w-full p-2 mb-4" />
                    <button 
                        className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600" 
                        onClick={handleSearch}>
                            Search
                    </button>
                    <button
                        className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600"
                        onClick={handleSendFriendRequest}>
                            Add Friend
                    </button>
                    {searchResult && (
                        <div>
                            <p>Username: {searchResult.userName}</p>
                            <img src={searchResult.avatar} alt="Avatar" className="w-32 h-32 rounded-full cursor-pointer mx-auto"/>
                        </div>
                    )}
                </div>
            </div>
        ), document.body);
    }

    // console.log("state: " + JSON.stringify({
    //     avatarUrl: avatarUrl,
    //     optionAvatarUrl: optionAvatarUrl,
    //     avatarSetting: avatarSetting
    // }, null, " "));

    return (
        <div className="account p-4 max-w-2xl mx-auto bg-white rounded-lg shadow-md mt-10">
            <div className="account-header mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Account</h2>
                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                    <Link to="/home">
                        Back to Home
                    </Link>
                </button>
            </div>
            <div className="account-body">
                {avatarSetting && avatarSettingPortal()}
                {isSearching && searchFriendByEmailPortal()}
                
                <div className="avatar mb-6 text-center">
                    <img 
                        src={optionAvatarUrl? optionAvatarUrl : (avatarUrl || "./default_avatar.jpg")}
                        alt=""
                        className="w-32 h-32 rounded-full cursor-pointer mx-auto"
                        onClick={() => setAvatarSetting(true)} />
                </div>

                <div className="account-information text-center mb-6">
                    <span className="block text-xl font-semibold">{currentUser?.userName}</span>
                    <p className="text-gray-600">{currentUser?.email}</p>
                    <div className="account-stat flex justify-around mt-4">
                        <div className="stat text-center">
                            <p className="font-semibold">Pictures</p>
                        </div>
                        <div className="stat text-center">
                            <p className="font-semibold">Friends</p>
                            {friendsData?.map((friend) => (
                                <div key={friend.id}>
                                    <p>{friend.name}</p>
                                    <img src={friend.avatar} alt="" className="w-10 h-10 rounded-full cursor-pointer mx-auto" />
                                </div>
                            ))}
                        </div>
                        <div className="stat text-center">
                            <p className="font-semibold">Requests</p>
                            {currentUser?.friendRequests?.map((request) => (
                                <div key={request}>
                                    <p>{request}</p>
                                    <button
                                        onClick={() => userController.acceptFriendRequest(currentUser.id, request)}>
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => userController.declineFriendRequest(currentUser.id, request)}>
                                        Decline
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="stat text-center">
                            <p className="font-semibold">Blocked</p>
                        </div>
                    </div>
                </div>
                <div className="setting text-center mb-6">
                    <button className="block w-full bg-blue-500 text-white px-4 py-2 mb-2 rounded-lg" type="button"
                            onClick={() => setIsSearching(true)}>
                        Find Friend
                    </button>
                    <button className="block w-full bg-blue-500 text-white px-4 py-2 mb-2 rounded-lg" type="button">
                        Change Nickname
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
