import "./conversation-view.css";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getDocRef } from "../../models/utils/firestore-method";
import { onSnapshot } from "firebase/firestore";
import { useUserStore } from "../../hooks/user-store";
import { useMessageStore } from "../../hooks/message-store";
import ChatController from "../../controllers/chat-controller";
import { dateToString } from "../../models/utils/date-method";
import { toast } from "react-toastify";

export default function ConversationView() {
    const navigate = useNavigate();
    const [state, setState] = useState(useLocation().state);

    const { conversationId } = useParams();
    const { currentUser, friendDatas } = useUserStore();
    const { messages, fetchMessages } = useMessageStore();

    const endRef = useRef(null);
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages[conversationId]]);

    useEffect(() => {
        if (state?.routing && messages[conversationId] && !state?.newMessage) {
            setState(null);
        }
        else {
            const conversationRef = getDocRef("conversations", conversationId);
            const unSubscribe = onSnapshot(conversationRef, { includeMetadataChanges: false }, async () => {
                await fetchMessages(conversationId);
                console.log("ConversationView: useEffect() for fetchMessages");
            });
            
            return () => unSubscribe();
        }
    }, [onSnapshot]);

    const handleGetAvatar = (senderId) => {
        if (senderId === currentUser.id) {
            return currentUser.avatar || "./default_avatar.jpg";
        }
        const friend = friendDatas.find((friend) => friend.id === senderId);
        return friend?.avatar || "./default_avatar.jpg";
    };

    const handleSendMessage = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const text = formData.get("text");
        
        if (text.trim() === "") return;
        const message = {
            text,
            senderId: currentUser.id,
            createdTime: dateToString(new Date())
        };

        await ChatController.sendMessage(conversationId, message).then( async () => {
            await ChatController.signalNewMessage(conversationId, currentUser.id).catch((error) => {
                toast.error("Failed to send message, please try again!");
            });
        }).catch((error) => {
            toast.error("Failed to send message, please try again!");
        });

        event.target.reset();
    };

    const handleFormFocus = async () => {
        const messagesArray = Array.isArray(messages[conversationId]) ? messages[conversationId] : [];
        const messagesId = messagesArray.filter(
            (message) => (message.senderId !== currentUser.id && !message.isSeen)
        ).map((message) => message.id);
        if (messagesId.length === 0) return;
        await ChatController.setIsSeenToMessages(currentUser.id, conversationId, messagesId);
    };

    const friendInfo = friendDatas.find((friend) =>
        Array.isArray(messages[conversationId]) && messages[conversationId].some((message) => message.senderId === friend.id && message.senderId !== currentUser.id)
    );

    const handleRouting = (path) => {
        navigate(path, { state: { routing: true } });
    }

    return (
        <div className="box-chat" key={conversationId}>
            <div className="header">
                <h2>Box Chat</h2>
                <div className="header-buttons">
                    <button onClick={() => handleRouting("/chat")}>
                        Back
                    </button>
                    <button onClick={() => handleRouting("/home")}>
                        Home
                    </button>
                </div>
            </div>
            {friendInfo && (
                <div className="detail">
                    <img src={handleGetAvatar(friendInfo.id)} alt="avatar" className="friend-avatar" />
                    <p className="friend-username">{friendInfo.name}</p>
                </div>
            )}
            <div className="body">
                <div className="conversation">
                    <div className="messages">
                        {Array.isArray(messages[conversationId]) && messages[conversationId].map((message) => (
                            <div
                                className={`message ${message?.senderId === currentUser.id ? "right" : "left"}`}
                                key={message?.id}
                            >
                                <div className="avatar-container">
                                    <img src={handleGetAvatar(message?.senderId)} alt="avatar" />
                                </div>
                                <div className="message-content">
                                    <p className="text">{message?.text}</p>
                                    <span className="time">{message?.createdTime}</span>
                                </div>
                            </div>
                        ))}
                        <div ref={endRef} />
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
                            <button type="submit" className="button-send">Gửi</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}