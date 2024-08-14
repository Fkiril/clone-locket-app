import "./home-view.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../hooks/user-store";
import ChatIcon from '../../assets/chat-icon.svg';
import UploadIcon from '../../assets/upload-icon.svg';
import ReactIcon from '../../assets/react-icon.svg';
import LeftArrowIcon from '../../assets/left-arrow-icon.svg';
import RightArrowIcon from '../../assets/right-arrow-icon.svg';
import SendIcon from '../../assets/send-icon.svg';

export default function HomeView() {
    const navigate = useNavigate();
  
    const { currentUser, pictureDatas, friendDatas, isFetching } = useUserStore();
    const avatarUrl = currentUser?.avatar ? currentUser.avatar : "./default_avatar.jpg";
    const [currentPictureIndex, setCurrentPictureIndex] = useState(0);

    const handleRouting = (path) => {
        navigate(path);
    }

    const handlePrevPicture = () => {
        setCurrentPictureIndex((prevIndex) => (prevIndex === 0 ? pictureDatas.length - 1 : prevIndex - 1));
    };

    const handleNextPicture = () => {
        setCurrentPictureIndex((prevIndex) => (prevIndex === pictureDatas.length - 1 ? 0 : prevIndex + 1));
    };

    const getOwnerInfo = (ownerId) => {
        return friendDatas.find((friendData) => friendData.id === ownerId);
    }

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
                            <img src={currentUser.avatarFileUrl || avatarUrl} alt="User Avatar" className="user-avatar" loading="eager"/>
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
                                        <img
                                            src={getOwnerInfo(pictureDatas[currentPictureIndex].ownerId)?.avatarFileUrl || "./default_avatar.jpg"}
                                            alt="Owner Avatar"
                                            className="owner-avatar"
                                        />
                                        <span className="owner-name">{getOwnerInfo(pictureDatas[currentPictureIndex].ownerId)?.name}</span>
                                    </div>
                                    <span className="send-time">{pictureDatas[currentPictureIndex].uploadTime}</span>
                                </div>
                                <img
                                    src={pictureDatas[currentPictureIndex].fileUrl || "./default_avatar.jpg"}
                                    alt="Friend's Picture"
                                    className="friend-picture"
                                />
                                <div className="picture-caption-container">
                                    <p className="picture-caption">{pictureDatas[currentPictureIndex].uploadTime}</p>
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
