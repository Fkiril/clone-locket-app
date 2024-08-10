import "./home-view.css";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserStore } from "../../hooks/user-store";
import { auth } from "../../models/services/firebase";
import { onSnapshot } from "firebase/firestore";
import { getDocRef } from "../../models/utils/firestore-method";
import ChatIcon from '../../assets/chat-icon.svg';
import UploadIcon from '../../assets/upload-icon.svg';
import ReactIcon from '../../assets/react-icon.svg';
import LeftArrowIcon from '../../assets/left-arrow-icon.svg';
import RightArrowIcon from '../../assets/right-arrow-icon.svg';
import SendIcon from '../../assets/send-icon.svg';

export default function HomeView() {
    const navigate = useNavigate();
    const [state, setState] = useState(useLocation().state);
    const { currentUser, pictureDatas, fetchUserInfo, isFetching } = useUserStore();
    const avatarUrl = currentUser?.avatar ? currentUser.avatar : "./default_avatar.jpg";
    const [currentPictureIndex, setCurrentPictureIndex] = useState(0);

    useEffect(() => {
        if (state?.routing && currentUser) {
            setState(null);
        }
        else if (auth?.currentUser?.uid) {
            const unSubscribe = onSnapshot(getDocRef("users", auth?.currentUser?.uid), async () => {
                await fetchUserInfo(auth?.currentUser.uid);

                console.log("home-view.js: useEffect() for onSnapshot");
            });

            return () => {
                unSubscribe();
            }
        }
        else {
            auth.authStateReady().then(async () => {
                await fetchUserInfo(auth?.currentUser.uid);
            }).catch((error) => {
                console.log("home-view.js: auth.authStateReady() error: ", error);
            });
        }
    }, [onSnapshot, auth]);

    const handleRouting = (path) => {
        navigate(path, { state: { routing: true } });
    }

    const handlePrevPicture = () => {
        setCurrentPictureIndex((prevIndex) => (prevIndex === 0 ? pictureDatas.length - 1 : prevIndex - 1));
    };

    const handleNextPicture = () => {
        setCurrentPictureIndex((prevIndex) => (prevIndex === pictureDatas.length - 1 ? 0 : prevIndex + 1));
    };

    return (
        <>
            {(isFetching) ? 
                <div>Loading...</div> :

                <div className="home">
                    <div className="header-container">
                        <h1 className="app-title">Clone-locket</h1>
                        <p className="app-subtitle">Clone-locket - Connect and share with your friends and family</p>
                    </div>
                    <div className="nav-buttons-container">
                        <button className="nav-buttons" onClick={() => handleRouting("/chat")}>
                            <img src={ChatIcon} alt="Chat Icon" className="nav-icon"/>
                        </button>
                        <button className="nav-buttons" onClick={() => handleRouting("/upload-picture")}>
                            <img src={UploadIcon} alt="Upload Icon" className="nav-icon"/>
                        </button>
                        <button className="avatar-container" onClick={() => handleRouting("/account")}>
                            <img src={avatarUrl} alt="User Avatar" className="user-avatar" loading="eager"/>
                        </button>
                    </div>
                    <div className="friends-pictures-container"> 
                        { pictureDatas.length > 0 ? (
                            <>
                                <button className="left-arrow" onClick={handlePrevPicture}>
                                    <img src={LeftArrowIcon} alt="Left Arrow" className="arrow-icon"/>
                                </button>
                                <div className="picture-header">    
        <div className="owner-info">
            <img src={pictureDatas[currentPictureIndex].ownerAvatar} alt="Owner Avatar" className="owner-avatar" />
            <span className="owner-name">{pictureDatas[currentPictureIndex].ownerName}</span>
        </div>
        <span className="send-time">{pictureDatas[currentPictureIndex].sendTime}</span>
    </div>
    <img src={pictureDatas[currentPictureIndex].url} alt="Friend's Picture" className="friend-picture" />
    <div className="picture-caption-container">
        <p className="picture-caption">{pictureDatas[currentPictureIndex].text}</p>
    </div>
    <div className="picture-actions">
        <button className="react-button">
            <img src={ReactIcon} alt="React Icon" className="action-icon"/>
        </button>
        <div className="message-section">
            <input type="text" placeholder="Type a message" className="message-input"/>
            <button className="send-button">
                <img src={SendIcon} alt="Send Icon" className="action-icon"/>
            </button>
        </div>
    </div>
                                <button className="right-arrow" onClick={handleNextPicture}>
                                    <img src={RightArrowIcon} alt="Right Arrow" className="arrow-icon"/>
                                </button>
                            </>
                        ) : (
                            <p className="no-friend-pictures">No pictures to display</p>
                        )}
                    </div>
                </div>
            }
        </>
    );
}
