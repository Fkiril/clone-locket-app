import "./account-view.css";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useUserStore } from "../../hooks/user-store";
import UserController from "../../controllers/user-controller";
import AuthenticationController from "../../controllers/authentication-controller";
import { toast } from "react-toastify";
import { updatePassword } from "firebase/auth";

export default function AccountView() {
    const navigate = useNavigate();
    
    const { auth, currentUser, friendsData } = useUserStore();
    const userController = currentUser ? new UserController(currentUser) : null;

    const [isSettingAvatar, setIsSettingAvatar] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState({
        file: null,
        url: ""
    });

    const [isSearching, setIsSearching] = useState(false);
    const [searchResult, setSearchResult] = useState(null);

    const [isChangingUserName, setIsChangingUserName] = useState(false);

    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const handleLogOut = async () => {
        await AuthenticationController.logOut();
        navigate("/");
    }

    const avatarSettingPortal = () => {
        const handleSelectAvatar = (event) => {
            if (event.target.files[0]) {
                const file = event.target.files[0];
                const url = URL.createObjectURL(event.target.files[0]);
                setSelectedAvatar({
                    file,
                    url
                })
            }
        };
    
        const submitOption = async () => {
            await userController.changeAvatar(selectedAvatar.file);
            setSelectedAvatar({
                file: null,
                url: ""
            });
            setIsSettingAvatar(false);
        }
    
        const cancelOption = () => {
            const fileInput = document.getElementById("file");
            fileInput.value = "";
            setSelectedAvatar({
                file: null,
                url: ""
            })
        }

        const handleDeleteAvatar = async () => {
            await userController.deleteAvatar();
            setIsSettingAvatar(false);
        }

        const handleClickOutside = (event) => {
            const clickElement = event.target;
            if (!(clickElement.closest(".avatar-setting .body"))) {
                setIsSettingAvatar(false);
                cancelOption();
            }
        }

        return createPortal((
            <div className="avatar-setting fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center" onClick={handleClickOutside}>
                <div className="body bg-white p-6 rounded-lg shadow-lg">
                    <img src={selectedAvatar.url? selectedAvatar.url : currentUser.avatar} alt="" className="w-32 h-32 rounded-full mx-auto mb-4" />
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
    }

    const searchingFriendByEmailPortal = () => {
        const handleSearch = async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const friendEmail = formData.get("friend-email");

            const result = await userController.getFriendByEmail(friendEmail);
            setSearchResult(result);
        }

        const handleSendFriendRequest = async () => {
            userController.sendFriendRequestById(currentUser.id, searchResult.id);
            setSearchResult(null);
        }

        const handleClickOutside = (event) => {
            const clickElement = event.target;
            if (!(clickElement.closest(".searching-friend-by-email .body"))) {
                setIsSearching(false);
            }
        }
    
        return createPortal((
            <div className="searching-friend-by-email fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center" onClick={handleClickOutside}>
                <div className="body bg-white p-6 rounded-lg shadow-lg">
                    <form onSubmit={handleSearch}>
                        <input
                            type="email"
                            placeholder="Enter friend's email!"
                            name="friend-email"
                        />
                        <button>Search</button>
                    </form>

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

    const changingUserNamePortal = () => {
        const handleChange = async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const newUserName = formData.get("new-username");
            userController.changeUserName(newUserName);
            setIsChangingUserName(false);
        }

        const handleClickOutside = (event) => {
            const clickElement = event.target;
            if (!(clickElement.closest(".changing-username .body"))) {
                setIsChangingUserName(false);
            }
        }

        return createPortal((
            <div className="changing-username" onClick={handleClickOutside}>
                <div className="body">
                    <form onSubmit={handleChange}>
                        <input
                            type="text"
                            name="new-username"
                            placeholder="Enter new User's name!"
                        />
                        <button>Change</button>
                    </form>
                </div>
            </div>
        ), document.body)
    }

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

            userController.changePassword(auth.currentUser, newPassword);
            // try {
            //     await updatePassword(auth.currentUser, newPassword);
            //     toast.success("Changed your password!");
            // } catch (error) {
            //     toast.error("Something went wrong. Please try again!.");
            //     console.log("Error changing password: ", error);
            // }
            setIsChangingPassword(false);
        }

        const handleClickOutside = (event) => {
            const clickElement = event.target;
            if (!(clickElement.closest(".changing-password .body"))) {
                setIsChangingPassword(false);
            }
        }

        return createPortal((
            <div className="changing-password" onClick={handleClickOutside}>
                <div className="body">
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
                        <button>Change</button>
                    </form>
                </div>
            </div>
        ), document.body)
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
                {isSettingAvatar && avatarSettingPortal()}
                {isSearching && searchingFriendByEmailPortal()}
                {isChangingUserName && changingUserNamePortal()}
                {isChangingPassword && changingPasswordPortal()}
                
                <div className="avatar mb-6 text-center">
                    <img 
                        src={currentUser?.avatar ? currentUser.avatar : "./default_avatar.jpg"}
                        alt=""
                        className="w-32 h-32 rounded-full cursor-pointer mx-auto"
                        onClick={() => setIsSettingAvatar(true)} />
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
                        Search Friend
                    </button>
                    <button className="block w-full bg-blue-500 text-white px-4 py-2 mb-2 rounded-lg" type="button"
                            onClick={() => setIsChangingUserName(true)}>
                        Change User's Name
                    </button>
                    <button className="block w-full bg-blue-500 text-white px-4 py-2 mb-2 rounded-lg" type="button"
                            onClick={() => setIsChangingPassword(true)}>
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
