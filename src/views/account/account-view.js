import "./account-view.css";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, Link } from "react-router-dom";
import { useUserStore } from "../../hooks/user-store";
import { toast } from "react-toastify";
import { onSnapshot } from "firebase/firestore";
import { getDocRef } from "../../models/utils/firestore-method";

import UserController from "../../controllers/user-controller";
import AuthenticationController from "../../controllers/authentication-controller";

import RequestsListPortal from "./RequestsListPortal";
import FriendsListPortal from "./FriendsListPortal";
import BlockedListPortal from "./BlockedListPortal";
import PicturesListPortal from "./PicturesListPortal";
import SearchBar from "./SearchBar"; // Import the new SearchBar component

export default function AccountView() {
    const navigate = useNavigate();
    
    const { currentAuth, currentUser, friendDatas, fetchUserInfo } = useUserStore();
    const userController = currentUser ? new UserController(currentUser) : null;

    const [isSettingAvatar, setIsSettingAvatar] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState({
        file: null,
        url: ""
    });

    const [isChangingUserName, setIsChangingUserName] = useState(false);

    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [isShowingFriends, setIsShowingFriends] = useState(false);

    const [isShowingRequests, setIsShowingRequests] = useState(false);

    const [isShowingBlocked, setIsShowingBlocked] = useState(false);

    const [isShowingPictures, setIsShowingPictures] = useState(false);
    
    useEffect(() => {
        if(currentUser) {
        const userRef = getDocRef("users", currentUser.id);
        
        const unSubscribe = onSnapshot(userRef, { includeMetadataChanges: false }, () => {
            fetchUserInfo(currentUser.id);
            console.log("account-view.js: useEffect() for onSnapshot: ");
            console.log("Current user: ", currentUser);
            console.log("Friend datas: ", friendDatas);
        });

        return () => unSubscribe();
        }
    }, [onSnapshot]);

    const handleLogOut = async () => {
        await AuthenticationController.logOut();
        navigate("/");
    };

    const avatarSettingPortal = () => {
        const handleSelectAvatar = (event) => {
        if (event.target.files[0]) {
            const file = event.target.files[0];
            const url = URL.createObjectURL(event.target.files[0]);
            setSelectedAvatar({
                file,
                url
            });
        }
        };
    
        const submitOption = async () => {
            await userController.changeAvatar(selectedAvatar.file);
            setSelectedAvatar({
                file: null,
                url: ""
            });
            setIsSettingAvatar(false);
        };
    
        const cancelOption = () => {
            const fileInput = document.getElementById("file");
            fileInput.value = "";
            setSelectedAvatar({
                file: null,
                url: ""
            });
        };

        const handleDeleteAvatar = async () => {
            await userController.deleteAvatar();
            setIsSettingAvatar(false);
        };

        const handleClickOutside = (event) => {
            const clickElement = event.target;
            if (!(clickElement.closest(".avatar-setting .body"))) {
                setIsSettingAvatar(false);
                cancelOption();
            }
        };

        return createPortal((
        <div className="avatar-setting fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center" onClick={handleClickOutside}>
            <div className="body bg-white p-6 rounded-lg shadow-lg">
                <img src={selectedAvatar.url ? selectedAvatar.url : currentUser.avatar} alt="" className="w-32 h-32 rounded-full mx-auto mb-4" />
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
                            onChange={handleSelectAvatar}
                        />
                    </button>
                    {selectedAvatar.url && (
                    <div className="flex space-x-2">
                        <button 
                            className="bg-green-500 text-white px-4 py-2 rounded-lg"
                            type="button"
                            onClick={submitOption}>
                            Save Change
                        </button>
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded-lg"
                            type="button"
                            onClick={cancelOption}>
                            Cancel
                        </button>
                    </div>
                    )}
                    {(currentUser.avatar !== "") && !selectedAvatar.url && (
                    <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
                            type="button" 
                            onClick={handleDeleteAvatar}>
                        Delete Avatar
                    </button>
                    )}
                </div>
            </div>
        </div>
        ), document.body);
    };

    const changingUserNamePortal = () => {
        const handleChange = async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const newUserName = formData.get("new-username");
            await userController.changeUserName(newUserName);
            setIsChangingUserName(false);
        };

        const handleClickOutside = (event) => {
            const clickElement = event.target;
            if (!(clickElement.closest(".changing-username .body"))) {
                setIsChangingUserName(false);
            }
        };

        return createPortal((
            <div className="changing-username fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center" onClick={handleClickOutside}>
                <div className="body bg-white p-6 rounded-lg shadow-lg">
                    <form onSubmit={handleChange}>
                        <input
                            type="text"
                            name="new-username"
                            placeholder="Enter new User's name!"
                        />
                        <button type="submit">Change</button>
                    </form>
                </div>
            </div>
        ), document.body);
    };

    const changingPasswordPortal = () => {
        const handleChange = async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const newPassword = formData.get("new-password");
            const confirmPassword = formData.get("confirm-password");
            if (newPassword !== confirmPassword) {
                toast.warning("Password does not match!");
                return;
            }

            await userController.changePassword(currentAuth.currentUser, newPassword);
            setIsChangingPassword(false);
        };

        const handleClickOutside = (event) => {
            const clickElement = event.target;
            if (!(clickElement.closest(".changing-password .body"))) {
                setIsChangingPassword(false);
            }
        };

        return createPortal((
        <div className="changing-password fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center" onClick={handleClickOutside}>
            <div className="body bg-white p-6 rounded-lg shadow-lg">
                <form onSubmit={handleChange}>
                    <input
                        type="password"
                        name="new-password"
                        placeholder="Enter new password!"
                    />
                    <input
                        type="password"
                        name="confirm-password"
                        placeholder="Enter confirm password!"
                    />
                    <button type="submit">Change</button>
                </form>
            </div>
        </div>
        ), document.body);
    };

    return (
        <div className="account-container">
        <div className="card gradient-overlay">
            <div className="account-header">
                <h2>Account</h2>
                <Link to="/home" className="back-button">
                    Back to Home
                </Link>
            </div>
            <div className="image">
                <img 
                    src={currentUser?.avatar ? currentUser.avatar : "./default_avatar.jpg"}
                    alt="avatar"
                    onClick={() => setIsSettingAvatar(true)}
                />
            </div>
            <div className="card-info">
                <span>{currentUser?.userName}</span>
                <p>{currentUser?.email}</p>
            </div>
        </div>

        <div className="account-body">
            {isSettingAvatar && avatarSettingPortal()}
            {isChangingUserName && changingUserNamePortal()}
            {isChangingPassword && changingPasswordPortal()}

            {isShowingFriends && <FriendsListPortal setIsShowingFriends={setIsShowingFriends} />}
            {isShowingRequests && <RequestsListPortal setIsShowingRequests={setIsShowingRequests} />}
            {isShowingBlocked && <BlockedListPortal setIsShowingBlocked={setIsShowingBlocked} />}
            {isShowingPictures && <PicturesListPortal setIsShowingPictures={setIsShowingPictures} />}
            
            <div className="account-stat">
            <div className="stat text-center">
                <button
                className="stat-button"
                onClick={() => setIsShowingPictures(true)}>
                Pictures
                {currentUser?.picturesCanSee?.length > 0 && (
                    <span className="pictures-count">
                    {currentUser?.picturesCanSee?.length}
                    </span>
                )}
                </button>
            </div>
            <div className="stat text-center">
                <button
                className="stat-button"
                onClick={() => setIsShowingFriends(true)}>
                Friends
                {friendDatas.length > 0 && (
                    <span className="friends-count">
                    {friendDatas.length}
                    </span>
                )}
                </button>
            </div>
            <div className="stat text-center">
                <button
                className="stat-button"
                onClick={() => setIsShowingRequests(true)}>
                Requests
                {currentUser?.friendRequests?.length > 0 && (
                    <span className="requests-count">
                    {currentUser?.friendRequests?.length}
                    </span>
                )}
                </button>
            </div>
            <div className="stat text-center">
                <button
                className="stat-button"
                onClick={() => setIsShowingBlocked(true)}>
                Blocked
                {currentUser?.blockedUsers?.length > 0 && (
                    <span className="blocked-count">
                    {currentUser?.blockedUsers?.length}
                    </span>
                )}
                </button>
            </div>
            </div>
            
            <SearchBar />

            <div className="setting">
            <button className="follow-button" type="button" onClick={() => setIsChangingUserName(true)}>
                Change User's Name
            </button>
            <button className="follow-button" type="button" onClick={() => setIsChangingPassword(true)}>
                Change Password
            </button>
            </div>
        </div>

        <button className="log-out" onClick={handleLogOut}>
            Log Out
        </button>
        </div>
    );
}
