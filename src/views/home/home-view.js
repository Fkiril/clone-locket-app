import "./home-view.css";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "../../hooks/user-store";
import { auth } from "../../models/services/firebase";
import { onSnapshot } from "firebase/firestore";
import { getDocRef } from "../../models/utils/firestore-method";

export default function HomeView() {
    const navigate = useNavigate();
    const [state, setState] = useState(useLocation().state)

    const { currentUser, pictureDatas, friendDatas, fetchUserInfo } = useUserStore();
    const avatarUrl = currentUser?.avatar ? currentUser.avatar : "./default_avatar.jpg";

    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current) {
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
    
                    console.log("home-view.js: auth.authStateReady()");
                }).catch((error) => {
                    console.log("home-view.js: auth.authStateReady() error: ", error);
                });
            }

            isMounted.current = true;
        }
    }, [onSnapshot]);

    const handleRouting = (path) => {
        navigate(path, { state: { routing: true } });
    }

    if (!currentUser || !pictureDatas) {
        return (
            <h1>loading...</h1>
        )
    }

    return (
        <>
            <div className="home min-h-screen flex flex-col items-center bg-gray-100">
                <div className="header-container text-center mb-1">
                    <h1 className="app-title">Clone-locket</h1>
                    <p className="app-subtitle">Clone-locket - Connect and share with your friends and family</p>
                </div>
                <div className="nav-buttons-container mb-1">
                    <button className="nav-buttons" onClick={() => handleRouting("/chat")}>Chat</button>
                    <button className="nav-buttons" onClick={() => handleRouting("/upload-picture")}>Upload a picture</button>
                    <button className="avatar-container" onClick={() => handleRouting("/account")}>
                        <img src={avatarUrl} alt="User Avatar" className="user-avatar" loading="eager"/>
                    </button>
                </div>
                <div className="friends-pictures-container mt-4"> 
                    {
                        pictureDatas.length > 0 ? (
                            pictureDatas.map((picture, index) => (
                                <div key = {index} className="friend-picture-frame"> 
                                    <div className="picture-header">    
                                        <span className="owner-name">{picture.ownerName}</span>
                                        <span className="send-time">{picture.sendTime}</span>
                                    </div>
                                    <img src={picture.url} alt="Friend's Picture" className="friend-picture" loading="lazy"/>
                                    <p>{friendDatas.find(friend => friend.id === picture.ownerId)?.name}: {picture.text}</p>
                                    <div className="picture-actions">
                                        <button className="react-button">React</button>
                                        <button className="message-button"> Send message</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-friend-pictures">No pictures to display</p>
                        )
                    }
                </div>
            </div>
    </>
    );
}
