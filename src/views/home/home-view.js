import "./home-view.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { auth } from "../../models/services/firebase";

import { useUserStore } from "../../hooks/user-store";
import { useChatListStore } from "../../hooks/chat-list-store";
import { useMessageStore } from "../../hooks/message-store";
import ChatController from "../../controllers/chat-controller";
import { timestampToString } from "../../models/utils/date-method";

import PictureGalleryPortal from "./PictureGalleryPortal";

import ChatIcon from '../../assets/chat-icon.svg';
import UploadIcon from '../../assets/upload-icon.svg';
import ReactIcon from '../../assets/react-icon.svg';
import LeftArrowIcon from '../../assets/left-arrow-icon.svg';
import RightArrowIcon from '../../assets/right-arrow-icon.svg';
import SendIcon from '../../assets/send-icon.svg';

export default function HomeView() {
    const navigate = useNavigate();
  
    const { currentUser, pictureDatas, friendDatas, isFetching } = useUserStore();
    const { fetchLastMessageOfConversation } = useChatListStore();
    const { fetchMessages, messages } = useMessageStore();
    const avatarUrl = currentUser?.avatar ? currentUser.avatar : "./default_avatar.jpg";
    const [currentPictureIndex, setCurrentPictureIndex] = useState(0);
    const [isViewingPictures, setIsViewingPictures] = useState(false);
    const [selectedFriendId, setSelectedFriendId] = useState(null);

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
        if (ownerId === currentUser?.id) {
            return currentUser;
        }
        return friendDatas.find((friendData) => friendData.id === ownerId);
    }
    const ownerInfo = getOwnerInfo(pictureDatas[currentPictureIndex]?.ownerId, currentUser);

    const handleSendMessage = async (event, friendId, picId) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const text = formData.get("message");
        
        if (text.trim() === "" || !friendId || !picId || friendId === "" || picId === "") return;

        console.log("send message: ", picId, friendId, text);
        const message = {
            text,
            senderId: currentUser.id,
            createdTime: new Date().getTime(),
            attachment: picId
        };

        let conversationId = await ChatController.getConversationIdWithFriend(currentUser.id, friendId);
        if (!conversationId) {
            conversationId = await ChatController.createConversation([currentUser.id, friendId]).catch((error) => {
                console.log("Error create conversation: ", error);
                toast.error("Failed to send message. Please try again.");
                event.target.reset();
                return;
            });
        }

        await ChatController.sendMessage(conversationId, message).then( async () => {
            toast.success("Sent message successfully");
            await fetchLastMessageOfConversation(auth?.currentUser?.uid, conversationId);
            if (messages[conversationId]) {
                await fetchMessages(conversationId);
            }
        }).catch((error) => {
            console.log("Error send message: ", error);
            toast.error("Failed to send message. Please try again.");
        });

        event.target.reset();
    }

    const handleReact = async (event, picId, emoji) => {
        event.preventDefault();

        if (!currentUser || !picId) return;

        await ChatController.reactPic(picId, currentUser.id, emoji).then(() => {
            
        }).catch((error) => {
            console.log("Error reacting to picture: ", error);
            toast.error("Failed to react. Please try again.");
        });

        event.target.reset();
    }

    const handleOpenGallery = (friendId) => {
        setSelectedFriendId(friendId);
        setIsViewingPictures(true);
    };

    const handleCloseGallery = () => {
        setIsViewingPictures(false);
        setSelectedFriendId(null);
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
                            <img src={currentUser?.avatarFileUrl || avatarUrl} alt="User Avatar" className="user-avatar" loading="eager"/>
                        </button>
                    </div>
                    <div className="friends-pictures-container"> 
                        { pictureDatas.length > 0 ? (
                            <>
                            <button className="left-arrow" onClick={handlePrevPicture}>
                                    <img src={LeftArrowIcon} alt="Left Arrow" className="arrow-icon"/>
                                </button>
                                <div className="picture-header" onClick={() => handleOpenGallery(pictureDatas[currentPictureIndex]?.ownerId)}>   
                                    <div className="owner-info">
                                        <img
                                            src={getOwnerInfo(pictureDatas[currentPictureIndex].ownerId)?.avatarFileUrl || getOwnerInfo(pictureDatas[currentPictureIndex].ownerId)?.avatar || "./default_avatar.jpg"}
                                            alt="Owner Avatar"
                                            className="owner-avatar"
                                        />
                                        <span className="owner-name">{getOwnerInfo(pictureDatas[currentPictureIndex]?.ownerId)?.name}</span>
                                    </div>
                                    <span className="send-time">{timestampToString(pictureDatas[currentPictureIndex]?.uploadTime)}</span>
                                </div>
                                <div className="friend-picture-frame">
                                    <img
                                        src={pictureDatas[currentPictureIndex]?.fileUrl || "./default_avatar.jpg"}
                                        alt="Friend's Picture"
                                        className="friend-picture"
                                    />
                                </div>
                                <div className="picture-caption-container">
                                    <p className="picture-caption">{(pictureDatas[currentPictureIndex]?.text)}</p>
                                </div>
                                {pictureDatas[currentPictureIndex]?.ownerId !== currentUser?.id && (
                                    <div className="picture-actions">
                                        <button className="react-button">
                                            <img src={ReactIcon} alt="React Icon" className="action-icon"/>
                                        </button>
                                        <form className="message-section" onSubmit={(event) => handleSendMessage(event, pictureDatas[currentPictureIndex].ownerId, pictureDatas[currentPictureIndex].id)}>
                                            <input type="text" name="message" placeholder="Type a message" className="message-input"/>
                                            <button className="send-button">
                                                <img src={SendIcon} alt="Send Icon" className="action-icon"/>
                                            </button>
                                        </form>
                                    </div>
                                )}
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
            {isViewingPictures && (
                <PictureGalleryPortal
                    friendId={pictureDatas[currentPictureIndex]?.ownerId}  // Truyền friendDatas vào đây
                    onClose={handleCloseGallery}
                />
            )}
        </>
    );
}


