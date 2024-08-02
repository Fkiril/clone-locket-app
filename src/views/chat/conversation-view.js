import React, { useEffect, useRef } from "react";
import { useUserStore } from "../../hooks/user-store";
import { useMessageStore } from "../../hooks/message-store";
import { Link, useParams } from "react-router-dom";
import ChatController from "../../controllers/chat-controller";
import { getDocRef } from "../../models/utils/firestore-method";
import { onSnapshot } from "firebase/firestore";
import { dateToString } from "../../models/utils/date-method";
import "./conversation-view.css";

export default function ConversationView() {
    const { conversationId } = useParams();
    const { currentUser, friendDatas } = useUserStore();
    const { messages, fetchMessages } = useMessageStore();
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages[conversationId]]);

    useEffect(() => {
        const conversationRef = getDocRef("conversations", conversationId);
        const unSubscribe = onSnapshot(conversationRef, { includeMetadataChanges: false }, () => {
            fetchMessages(conversationId);
        });
        return () => unSubscribe();
    }, [onSnapshot, conversationId, fetchMessages]);

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
        await ChatController.sendMessage(conversationId, message);
        await ChatController.signalMessage(conversationId, currentUser.id);
        event.target.reset();
    };

    const handleFormFocus = async () => {
        const messagesArray = Array.isArray(messages[conversationId]) ? messages[conversationId] : [];
        const messagesId = messagesArray.filter(
            (message) => (message.senderId !== currentUser.id && !message.isSeen)
        ).map((message) => message.id);
        await ChatController.setIsSeenToMessages(currentUser.id, conversationId, messagesId);
    };

    const friendInfo = friendDatas.find((friend) =>
        Array.isArray(messages[conversationId]) && messages[conversationId].some((message) => message.senderId === friend.id && message.senderId !== currentUser.id)
    );

    return (
        <div className="box-chat" key={conversationId}>
            <div className="header">
                <h2>Box Chat</h2>
                <div className="header-buttons">
                    <button>
                        <Link to="/chat">Trở về</Link>
                    </button>
                    <button>
                        <Link to="/home">Trang chủ</Link>
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