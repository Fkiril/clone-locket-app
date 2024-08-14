import "./conversation-view.css";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { auth } from "../../models/services/firebase";
import { getDocRef } from "../../models/utils/firestore-method";
import { onSnapshot } from "firebase/firestore";

import { useUserStore } from "../../hooks/user-store";
import { useMessageStore } from "../../hooks/message-store";
import { useChatListStore } from "../../hooks/chat-list-store";

import ChatController from "../../controllers/chat-controller";
import { timestampToString } from "../../models/utils/date-method";

export default function ConversationView() {
    const navigate = useNavigate();
    const [showDetail, setShowDetail] = useState(false);

    const { conversationId } = useParams();
    const { currentUser, friendDatas } = useUserStore();
    const { messages, fetchMessages, fetchAdditionalMessages, fetchedAll } = useMessageStore();
    const { chatManager, fetchLastMessageOfConversation } = useChatListStore();
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
        if (hasScrolledToTop && !fetchedAll) {
            console.log("conversation-view.js: fetchAdditionalMessages");
            fetchAdditionalMessages(conversationId);
        }
    }, [hasScrolledToTop, fetchedAll])

    const endRef = useRef(null);
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages[conversationId]]);

    useEffect(() => {
        if (auth?.currentUser?.uid && chatManager && (!messages[conversationId] || chatManager.conversationStates[conversationId] > 0)) {
            const unSubscribe = onSnapshot(
                getDocRef("conversations", conversationId),
                { includeMetadataChanges: false },
                async () => {
                    console.log("conversation-view.js: fetchMessages for onSnapshot");
                    await fetchMessages(conversationId);
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

        await ChatController.sendMessage(conversationId, message).then( async () => {
            await ChatController.signalNewMessage(conversationId, currentUser.id).then(async() => {
                await fetchLastMessageOfConversation(auth?.currentUser?.uid, conversationId);
            }).catch((error) => {
                toast.error("Failed to send message, please try again!");
            });
        }).catch((error) => {
            toast.error("Failed to send message, please try again!");
        });

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
            }
            await ChatController.setIsSeenToMessages(currentUser.id, conversationId, messagesId);
        }
    };

    const friendInfo = friendDatas.find(async (friend) => await ChatController.getFriendIdByConversationId(currentUser.id, conversationId) === friend.id);

    const handleRouting = (path) => {
        navigate(path);
    }

    const toggleDetail = () => setShowDetail(!showDetail);

    return (
        <div className="conversation-container" key={conversationId}>
            <div className="header">
                <button className="back-button" onClick={() => handleRouting("/chat")}>
                    <img src="/back-icon.svg" alt="Back" className="icon" />
                </button>
                <h2>Box Chat</h2>
                <button className="info-button" onClick={toggleDetail}>
                    <img src="/info-icon.svg" alt="Info" className="icon" />
                </button>
            </div>
            {friendInfo && showDetail && (
                <div className="detail">
                    <img src={handleGetAvatar(friendInfo.id)} alt="avatar" />
                    <p className="friend-username">{friendInfo.name}</p>
                </div>
            )}
            <div className="body">
                <div className="conversation">
                    <div className="messages">
                        {Array.isArray(messages[conversationId]) && messages[conversationId].map((message) => (
                            <div
                                className={`message ${message?.senderId === currentUser?.id ? "right" : "left"}`}
                                key={message?.id}
                            >
                                <div className="avatar-container">
                                    <img src={handleGetAvatar(message?.senderId)} alt="avatar" />
                                </div>
                                <div className="message-content">
                                    <p className="text">{message?.text}</p>
                                    <span className="time">{timestampToString(message?.createdTime)}</span>
                                </div>
                            </div>
                        ))}
                        <div ref={endRef} />
                    </div>
                </div>
            </div>
            <div className="input-section">
                <form onSubmit={handleSendMessage} className="new-message" onFocus={handleFormFocus}>
                    <input
                        type="text"
                        name="text"
                        id="text"
                        placeholder="Enter message"
                        defaultValue={""}
                        className="message-send"
                    />
                    <button type="submit" className="button-send">
                        <img src="/send-icon.svg" alt="Send" className="icon" />
                    </button>
                </form>
            </div>
        </div>
    );
}
