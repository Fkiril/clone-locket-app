import { onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserStore } from "../../hooks/user-store";
import { toast } from "react-toastify";
import { auth } from "../../models/services/firebase";
import { getDocRef } from "../../models/utils/firestore-method";
import "./account-view.css";

import AuthenticationController from "../../controllers/authentication-controller";
import UserController from "../../controllers/user-controller";

import { onAuthStateChanged } from "firebase/auth";
import BlockedListPortal from "./BlockedListPortal";
import FriendsListPortal from "./FriendsListPortal";
import PicturesListPortal from "./PicturesListPortal";
import RequestsListPortal from "./RequestsListPortal";
import SearchBar from "./SearchBar"; // Import the new SearchBar component

export default function AccountView() {
    const navigate = useNavigate();
    const [state, setState] = useState(useLocation().state);
    
    const { currentUser, friendDatas, fetchUserInfo } = useUserStore();

    const [userController, setUserController] = useState(
        currentUser? new UserController(currentUser) : null
    );

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
        if (state?.routing && currentUser) {
            setState(null);
        }
        else if (auth?.currentUser?.uid) {
            const unSubscribe = onSnapshot(getDocRef("users", auth?.currentUser.uid), { includeMetadataChanges: false }, async () => {
                await fetchUserInfo(auth?.currentUser.uid);
    
                setUserController(new UserController(currentUser));
                
                console.log("account-view.js: useEffect() for onSnapshot");
            });
    
            return () => {
                unSubscribe();
            }
        }
        else {
            auth.authStateReady().then(async () => {
                await fetchUserInfo(auth?.currentUser.uid);
            }).catch((error) => {
                console.log("account-view.js: auth.authStateReady() error: ", error);
            });
        }
    }, [onSnapshot]);

    useEffect(() => {
        const unSubscribe = auth.onAuthStateChanged(() => {
            console.log("account-view.js: useEffect() for onAuthStateChanged");
            if (!(auth?.currentUser) || !currentUser) navigate("/");
        });

        return () => {
            unSubscribe();
        }
    }, [auth, onAuthStateChanged]);

    const handleLogOut = async () => {
        await AuthenticationController.logOut().then(() => {
            toast.success("Logout successfull");
        }).catch((error) => {
            toast.error("Failed to log out. Please try again.");
        });
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
            await userController.changeAvatar(selectedAvatar.file).then(() => {
                toast.success("Change avatar successfull!");
                setSelectedAvatar({
                    file: null,
                    url: ""
                });
                setIsSettingAvatar(false);
            }).catch((error) => {
                toast.error("Failed to change avatar. Please try again.");
            });
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
            await userController.deleteAvatar().then(() => {
                toast.success("Delete avatar successfull!");
                setIsSettingAvatar(false);
            });
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

            await userController.changeUserName(newUserName).then(() => {
                toast.success("Change username successfull!");
                setIsChangingUserName(false);
            }).catch((error) => {
                toast.error("Failed to change username. Please try again.");
            });
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

            await userController.changePassword(auth.currentUser, newPassword).then(() => {
                toast.success("Change password successfull!");
                setIsChangingPassword(false);
            }).catch((error) => {
                toast.error("Failed to change password. Please try again.");
            });
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

    const handleBackToHome = () => {
        navigate("/home", { state: { routing: true } });
    };

    const handleDeteleAccount = async () => {
        await AuthenticationController.deleteAccount({ userId: currentUser?.id, avatar: currentUser?.avatar}).then((result) => {
            toast.success("Delete account successfull!");
        }).catch((error) => {
            toast.error("Failed to delete account. Please try again.");
        });
    };

    return (
        <div className="account-container">
            <div className="card">
                <div className="image">
                    <img src={currentUser?.avatar ? currentUser.avatar : "./default_avatar.jpg"} alt="avatar" />
                </div>
                <div className="card-info">
                    <span>{currentUser?.userName}</span>
                    <p>{currentUser?.email}</p>
                </div>
                <button onClick={handleBackToHome} className="home-icon-button">
                    <div className="home-icon"></div>
                </button>
            </div>
    
            <div className="account-body">
                {isSettingAvatar && avatarSettingPortal()}
                {isChangingUserName && changingUserNamePortal()}
                {isChangingPassword && changingPasswordPortal()}
    
                {isShowingFriends && <FriendsListPortal setIsShowingFriends={setIsShowingFriends} />}
                {isShowingRequests && <RequestsListPortal setIsShowingRequests={setIsShowingRequests} />}
                {isShowingBlocked && <BlockedListPortal setIsShowingBlocked={setIsShowingBlocked} />}
                {isShowingPictures && <PicturesListPortal setIsShowingPictures={setIsShowingPictures} />}
    
                <div className="friends-section">
                    <h3>Friends</h3>
                    {/* Thanh Search Bar thay thế nút "Find Friends" */}
                    <SearchBar />
                    <button onClick={() => setIsShowingFriends(true)}>Friends List</button>
                    <button onClick={() => setIsShowingRequests(true)}>Requests</button>
                    <button onClick={() => setIsShowingBlocked(true)}>Blocked</button>
                </div>
    
                <div className="settings-section">
                    <h3>Settings</h3>
                    <button onClick={() => setIsChangingUserName(true)}>Change username</button>
                    <button onClick={() => setIsChangingPassword(true)}>Change password</button>
                    <button className="log-out" onClick={handleLogOut}>Log out</button>
                </div>
            </div>
        </div>
    );    
    
}
