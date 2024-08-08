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
    const [showDetail, setShowDetail] = useState(false);

    const { conversationId } = useParams();
    const { currentUser, friendDatas } = useUserStore();
    const { messages, fetchMessages } = useMessageStore();

    const [finishSending, setFinishSending] = useState(false);

    const endRef = useRef(null);
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages[conversationId]]);

    useEffect(() => {
        console.log("ConversationView: useEffect()");
        if (state?.routing && messages[conversationId] && !state?.newMessage) {
            setState(null);
        } else {
            const conversationRef = getDocRef("conversations", conversationId);
            const unSubscribe = onSnapshot(conversationRef, { includeMetadataChanges: false }, async () => {
                console.log("finishSending: ", finishSending);
                if (finishSending) {
                    await fetchMessages(conversationId);
                    setFinishSending(false);
                }
                else {
                    setTimeout(async () => {
                        await fetchMessages(conversationId);
                    }, 1000);
                }
                console.log("ConversationView: useEffect() for fetchMessages");
            });
            
            return () => unSubscribe();
        }
    }, [onSnapshot]);

    const handleGetAvatar = (senderId) => {
        if (!currentUser) return "./default_avatar.jpg";
        if (senderId === currentUser.id) {
            return currentUser.avatar || "./default_avatar.jpg";
        }
        const friend = friendDatas?.find((friend) => friend.id === senderId);
        return friend?.avatar || "./default_avatar.jpg";
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
            createdTime: dateToString(new Date())
        };

        await ChatController.sendMessage(conversationId, message).then( async () => {
            await ChatController.signalNewMessage(conversationId, currentUser.id).then(() => {
                setFinishSending(true);
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
        await ChatController.setIsSeenToMessages(currentUser.id, conversationId, messagesId);
    };

    const friendInfo = friendDatas.find(async (friend) => await ChatController.getFriendIdByConversationId(currentUser.id, conversationId) === friend.id);

    const handleRouting = (path) => {
        navigate(path, { state: { routing: true } });
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
                                    <span className="time">{message?.createdTime}</span>
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
