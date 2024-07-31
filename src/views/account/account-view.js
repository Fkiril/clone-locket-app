import "./account-view.css";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useUserStore } from "../../hooks/user-store";
import UserController from "../../controllers/user-controller";
import AuthenticationController from "../../controllers/authentication-controller";
import { toast } from "react-toastify";
import { doc, onSnapshot } from "firebase/firestore";
import { fs_db } from "../../models/services/firebase";

export default function AccountView() {
    const navigate = useNavigate();
    
    const { auth, currentUser, friendDatas, requestDatas, fetchUserInfo } = useUserStore();
    const userController = currentUser ? new UserController(currentUser) : null;

    const [isSettingAvatar, setIsSettingAvatar] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState({
        file: null,
        url: ""
    });

    const [isSearching, setIsSearching] = useState(false);
    const [searchResult, setSearchResult] = useState({
        user: null,
        state: ""
    });

    const [isChangingUserName, setIsChangingUserName] = useState(false);

    const [isChangingPassword, setIsChangingPassword] = useState(false);

    
    useEffect(() => {
        if(currentUser) {
        const userRef = doc(fs_db, "users", currentUser.id);
        
        const unSubscribe = onSnapshot(userRef, { includeMetadataChanges: false }, () => {
            console.log("account-view.js: useEffect() for onSnapshot: ", currentUser);
            fetchUserInfo(currentUser.id);
        });

        return () => unSubscribe();
        }
    }, [onSnapshot]);

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

    const searchingFriendPortal = () => {
        const handleSearch = async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const friendEmail = formData.get("friend-email");

            const result = await userController.getFriendByEmail(friendEmail);
            if (result == null) {
                setSearchResult({
                    user: null,
                    state: "invalid"
                });
            }
            else {
                if (currentUser.friends.includes(result.id)) {
                    setSearchResult({
                        user: result,
                        state: "friend"
                    });
                }
                else if (currentUser.friendRequests.includes(result.id) || result.friendRequests.includes(currentUser.id)) {
                    setSearchResult({
                        user: result,
                        state: currentUser.friendRequests.includes(result.id) ? "received" : "sended"
                    });
                }
                else {
                    setSearchResult({
                        user: result,
                        state: "valid"
                    });
                }
            }
        }

        const handleOutPortal = () => {
            setSearchResult({
                user: null,
                state: ""
            });
            setIsSearching(false);
        }

        const handleClickOutside = (event) => {
            const clickElement = event.target;
            if (!(clickElement.closest(".searching-friend-by-email .body"))) {
                handleOutPortal();
            }
        }

        return createPortal((
            <div className="searching-friend-by-email fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center" onClick={handleClickOutside}>
                <div className="body bg-white p-6 rounded-lg shadow-lg">
                    <form className="email-form" onSubmit={handleSearch}>
                        <input
                            type="email"
                            placeholder="Enter friend's email!"
                            name="friend-email"
                        />
                        <button>Search</button>
                    </form>

                    {searchResult.user != null && (
                        <div className="search-result">
                            <p>Username: {searchResult.user.userName}</p>
                            <img src={searchResult.user.avatar? searchResult.user.avatar : "./default_avatar.jpg"} alt="Avatar" className="w-32 h-32 rounded-full cursor-pointer mx-auto"/>
                            
                            {searchResult.state === "valid" && (
                                <button
                                    className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600"
                                    onClick={async () => {
                                        await userController.sendFriendRequestById(searchResult.user.id);
                                        handleOutPortal();
                                    }}>
                                        Add Friend
                                </button>
                            )}
                            {searchResult.state === "friend" && (
                                <p>You are friend!</p>
                            )}
                            {searchResult.state === "sended" && (
                                <button
                                    className="bg-gray-500 text-white rounded p-2 hover:bg-gray-600"
                                    onClick={async () => {
                                        await userController.cancelFriendRequest(searchResult.user.id);
                                        handleOutPortal();
                                    }}>
                                    Cancel Request
                                </button>
                            )}
                            {searchResult.state === "received" && (
                                <div>
                                    <button
                                        className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600"
                                        onClick={async () => {
                                            await userController.acceptFriendRequest(searchResult.user.id);
                                            handleOutPortal();
                                        }}>
                                        Accept Request
                                    </button>
                                    <button
                                        className="bg-gray-500 text-white rounded p-2 hover:bg-gray-600"
                                        onClick={async () => {
                                            await userController.declineFriendRequest(searchResult.user.id);
                                            handleOutPortal();
                                        }}>
                                        Decline Request
                                    </button>
                                </div>
                            )}
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
            await userController.changeUserName(newUserName);
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

            await userController.changePassword(auth.currentUser, newPassword);
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
                {isSearching && searchingFriendPortal()}
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
                            <p className="font-semibold">Friends</p>
                            {friendDatas?.map((friend) => (
                                <div key={friend.id}>
                                    <p>{friend.name}</p>
                                    <img src={friend.avatar? friend.avatar : "./default_avatar.jpg"} alt="" className="w-10 h-10 rounded-full cursor-pointer mx-auto" />
                                </div>
                            ))}
                        </div>
                        <div className="stat text-center">
                            <p className="font-semibold">Requests</p>
                            {requestDatas?.map((request) => (
                                <div key={request.id}>
                                    <p>{request.name}</p>
                                    <img src={request.avatar? request.avatar : "./default_avatar.jpg"} alt="" className="w-10 h-10 rounded-full cursor-pointer mx-auto" />
                                    <button
                                        onClick={async () => await userController.acceptFriendRequest(request.id)}>
                                        Accept
                                    </button>
                                    <button
                                        onClick={async () => await userController.declineFriendRequest(request.id)}>
                                        Decline
                                    </button>
                                </div>
                            ))}
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