import "./box-chat-view.css";
import React, { useEffect } from "react";
import { useUserStore } from "../../hooks/user-store";
import { useMessageStore } from "../../hooks/message-store";
import { useNavigate, Link, useParams } from "react-router-dom";
import ChatController from "../../controllers/chat-controller";
import { doc, onSnapshot } from "firebase/firestore";
import { fs_db } from "../../models/services/firebase";

export default function BoxChatView() {
    const { boxChatId } = useParams();
    const navigate = useNavigate();
    const { currentUser, friendsData } = useUserStore();
    const { messages, fetchMessages } = useMessageStore();

    useEffect(() => {
        const boxChatRef = doc(fs_db, "boxChats", boxChatId);

        const unSubscribe = onSnapshot(boxChatRef, { includeMetadataChanges: false }, () => {
            console.log("box-chat-view.js: useEffect() for onSnapshot: ", messages);
            fetchMessages(boxChatId);
        });
  
        return () => unSubscribe();
    }, [onSnapshot]);

    const handleGetAvatar = (senderId) => {
        if (senderId === currentUser.id) {
            return currentUser.avatar? currentUser.avatar : "./default_avatar.jpg";
        }
        
        const friend = friendsData.find((friend) => friend.id === senderId);
        if (friend) {
            return friend.avatar? friend.avatar : "./default_avatar.jpg";
        } else {
            return "./default_avatar.jpg";
        }
    };

    const handleSendMessage = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const text = formData.get("text");
        const message = {
            text: text,
            senderId: currentUser.id
        }
        await ChatController.sendMessage(boxChatId, message);

        event.target.reset();
    };

    return (
        <div className="box-chat" key={boxChatId}>
            <div className="header">
                <p>Box Chat</p>
                <button>
                    <Link to="/home">Home</Link>
                </button>
            </div>
            <div className="body">
                <div className="conversation">
                    <div className="messages">
                        {messages?.map((message) => (
                            <>
                                { message.senderId === currentUser.id ? (
                                    <div className="message left" key={message.id}>
                                        <div className="infor">
                                            <p className="text">{message.text}</p>
                                            <div className="time">{message.createTime}</div>
                                            <div className="state"></div>
                                        </div>
                                        <img src={handleGetAvatar(message.senderId)} alt="" />
                                    </div>
                                ) : (
                                    <div className="message right" key={message.id}>
                                        <img src={handleGetAvatar(message.senderId)} alt="" />
                                        <div className="infor">
                                            <p className="text">{message.text}</p>
                                            <div className="time">{message.createTime}</div>
                                            <div className="state"></div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ))}
                    </div>
                    <div className="input">
                        <form onSubmit={handleSendMessage} className="new-message">
                            <input
                                type="text"
                                name="text"
                                id="text"
                                placeholder="Enter message"
                                defaultValue={""}
                            />
                            <button type="submit">Send</button>
                        </form>
                    </div>
                </div>
                <div className="detail">
                    <p>Detail</p>
                    <p>Detail</p>
                    <p>Detail</p>
                    <p>Detail</p>
                </div>
            </div>
        </div>
    );
};
