import "./conversation-view.css";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { auth } from "../../models/services/firebase";
import { getDocRef } from "../../models/utils/firestore-method";
import { onSnapshot } from "firebase/firestore";

import { useUserStore } from "../../hooks/user-store";
import { useMessageStore } from "../../hooks/message-store";
import { useChatListStore } from "../../hooks/chat-list-store";
import { useInternetConnection } from "../../hooks/internet-connection";

import ChatController from "../../controllers/chat-controller";
import { timestampToString } from "../../models/utils/date-method";

import DisconnectionPortal from "../disconnection/disconnection-portal";

import InfoIcon from "../../assets/info-icon.svg";
import SendIcon from "../../assets/send-icon.svg";
import BackIcon from "../../assets/back-icon.svg";

export default function ConversationView() {
    const navigate = useNavigate();
    
    const { conversationId } = useParams();
    
    const { connectionState } = useInternetConnection();
    const { currentUser, friendDatas } = useUserStore();
    const { messages, fetchMessages, fetchAdditionalMessages, fetchedAll, isLoading } = useMessageStore();
    const { chatManager, fetchLastMessageOfConversation } = useChatListStore();
    
    const [showDetail, setShowDetail] = useState(false);
    
    const [hasScrolledToTop, setHasScrolledToTop] = useState(false);
    const bodyElement = document.querySelector('.body');
    let timeoutId;
    bodyElement?.addEventListener('scroll', () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            if (bodyElement.scrollTop === 0 && !hasScrolledToTop) {
                setHasScrolledToTop(true);
            }
            else {
                setHasScrolledToTop(false);
            }
        }, 1000);
    });

    useEffect(() => {
        if (hasScrolledToTop && !fetchedAll[conversationId]) {
            console.log("conversation-view.js: fetchAdditionalMessages");
            fetchAdditionalMessages(conversationId, messages[conversationId]?.[0]?.createdTime);
        }
    }, [hasScrolledToTop, fetchedAll[conversationId]]);

    const endRef = useRef(null);
    useEffect(() => {
        if (!hasScrolledToTop) endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages[conversationId]]);

    const [nearestFetch, setNearestFetch] = useState(0);
    useEffect(() => {
        if (auth?.currentUser?.uid && chatManager && (!messages[conversationId] || chatManager.conversationStates[conversationId] > 0)) {
            const unSubscribe = onSnapshot(
                getDocRef("conversations", conversationId),
                { includeMetadataChanges: false },
                async () => {
                    console.log("conversation-view.js: fetchMessages for onSnapshot");
                    await fetchMessages(conversationId);
                    setNearestFetch(Date.now());
                }
            )

            return () => {
                unSubscribe()
            }
        }
    }, [onSnapshot])

    const handleGetAvatar = (senderId) => {
        if (!currentUser) return "./default_avatar.jpg";
        if (senderId === currentUser.id) {
            return currentUser.avatarFileUrl || currentUser.avatar || "./default_avatar.jpg";
        }
        const friend = friendDatas?.find((friend) => friend.id === senderId);
        if (!friend) return "./default_avatar.jpg";
        return friend?.avatarFileUrl || friend?.avatar || "./default_avatar.jpg";
    };

    const handleSendMessage = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const text = formData.get("text");
        
        if (text.trim() === "") return;
        if (!currentUser) {
            toast.error("User not found, please try again!");
            return;
        }

        const message = {
            text,
            senderId: currentUser.id,
            createdTime: new Date().getTime(),
        };

        await Promise.all([
            ChatController.sendMessage(conversationId, message),
            ChatController.signalNewMessage(conversationId, currentUser.id),
        ]).catch((error) => {
            console.log("Error send message: ", error);
            toast.error("Failed to send message. Please try again!");
            return;
        });

        await fetchLastMessageOfConversation(auth?.currentUser?.uid, conversationId);
        const now = Date.now();
        if (now - nearestFetch > 1000) {
            await fetchMessages(conversationId);
            setNearestFetch(now);
        }

        event.target.reset();
    };

    const handleFormFocus = async () => {
        if (!currentUser) return;
        const messagesArray = Array.isArray(messages[conversationId]) ? messages[conversationId] : [];
        const messagesId = messagesArray.filter(
            (message) => (message.senderId !== currentUser.id && !message.isSeen)
        ).map((message) => message.id);
        if (messagesId.length === 0) return;
        else {
            for (const mId of messagesId) {
                messages[conversationId].find((message) => message.id === mId).isSeen = true;
                chatManager.conversationStates[conversationId] = 0;
            }
            await ChatController.setIsSeenToMessages(currentUser.id, conversationId, messagesId);
        }
    };

    const friendInfo = useMemo(() => {
        if (!chatManager || !chatManager?.friendConversations) return null;
        return friendDatas?.find((friend) => friend.id === Object.keys(chatManager?.friendConversations).find(key => chatManager?.friendConversations[key] === conversationId));
    }, [conversationId]);

    const isBlocked = useMemo(() => {
        return friendInfo?.blockeds?.includes(currentUser?.id);
    }, [friendInfo]);

    const handleRouting = (path) => {
        navigate(path);
    }

    const toggleDetail = () => setShowDetail(!showDetail);

    return (
        <>
            {!connectionState && <DisconnectionPortal />}
            <div className="conversation-container" key={conversationId}>
                <div className="header">
                    <button className="back-button" onClick={() => handleRouting("/chat")}>
                        <img src={BackIcon} alt="Back" className="icon" />
                    </button>
                    <h2>Box Chat</h2>
                    <button className="info-button" onClick={toggleDetail}>
                        <img src={InfoIcon} alt="Info" className="icon" />
                    </button>
                </div>
                {friendInfo && showDetail && (
                    <div className="detail">
                        <img src={handleGetAvatar(friendInfo.id)} alt="avatar" />
                        <p className="friend-username">{friendInfo.name}</p>
                    </div>
                )}
                {!isLoading && <div className="body">
                    <div className="conversation">
                        <div className="messages">
                            {!fetchedAll[conversationId] &&
                                <button className="fetch-button" onClick={async () => fetchAdditionalMessages(conversationId, messages[conversationId]?.[0]?.createdTime)}>+</button>
                            } 
                            {Array.isArray(messages[conversationId]) && messages[conversationId].map((message) => (
                                <div
                                    className={`message ${message?.senderId === currentUser?.id ? "right" : "left"}`}
                                    key={message?.id}
                                >
                                    <div className="avatar-container">
                                        <img src={handleGetAvatar(message?.senderId)} alt="avatar" />
                                    </div>
                                    <div className="message-content">
                                        {message?.attachment && <img src={message?.attachmentFileUrl} alt="attachment" />}
                                        <p className="text">{message?.text}</p>
                                        <span className="time">{timestampToString(message?.createdTime)}</span>
                                    </div>
                                </div>
                            ))}
                            <div ref={(ref) => {
                                endRef.current = ref;
                            }} />
                        </div>
                    </div>
                </div>}
                <div className="input-section">
                    <form onSubmit={handleSendMessage} className="new-message" onFocus={handleFormFocus} autoComplete="off">
                        <input
                            type="text"
                            name="text"
                            id="text"
                            placeholder={isBlocked ? "You are blocked by this user" : "Type a message..."}
                            autoComplete="off"
                            disabled={isBlocked}
                            defaultValue={""}
                            className="message-send"
                        />
                        <button type="submit" className="button-send" disabled={isBlocked}>
                            <img src={SendIcon} alt="Send" className="icon" />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
