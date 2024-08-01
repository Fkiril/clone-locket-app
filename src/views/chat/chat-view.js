import "./chat-view.css";
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUserStore } from "../../hooks/user-store";
import { useChatListStore } from "../../hooks/chat-list-store";
import ChatController from "../../controllers/chat-controller";
import { toast } from "react-toastify";
import { onSnapshot } from "firebase/firestore";
import { getDocRef } from "../../models/utils/firestore-method";

export default function ChatView() {
    const navigate = useNavigate();
    const { currentUser, friendDatas } = useUserStore();
    const { conversations, lastMessages, fetchLastMessages } = useChatListStore();
    const [searchedFriend, setSearchedFriend] = useState(null);

    useEffect(() => {
        if (currentUser) {
            const docRef = getDocRef("chatManagers", currentUser.id);
            const unSubscribe = onSnapshot(docRef, { includeMetadataChanges: false }, () => {
                fetchLastMessages(currentUser.id);
            });
            
            return () => {
                unSubscribe();
            }
        }
    }, [currentUser, fetchLastMessages]);

    const handleNavigate = async (friendId) => {
        let conversationId = await ChatController.getConversationIdWithFriend(currentUser.id, friendId);
        if (!conversationId) {
            conversationId = await ChatController.createConversation([currentUser.id, friendId]);
        }
        navigate(`/conversation/${conversationId}`);
    }

    const handleSearchFriend = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const searchInput = formData.get("search-input");

        if (!searchInput) {
            setSearchedFriend(null);
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(searchInput)) {
                const friend = friendDatas.find((friend) => friend.email === searchInput);
                if (friend) {
                    setSearchedFriend(friend);
                } else {
                    toast.info("No friend found with this email.");
                    setSearchedFriend(null);
                }
            } else {
                const friend = friendDatas.find((friend) => friend.name.toLowerCase() === searchInput.toLowerCase());
                if (friend) {
                    setSearchedFriend(friend);
                } else {
                    toast.info("No friend found with this name.");
                    setSearchedFriend(null);
                }
            }
        }
        event.target.reset();
    }

    // Hàm tính toán khoảng thời gian đã trôi qua
    const timeSince = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = Math.floor(seconds / 31536000);

        if (interval >= 1) return `${interval}y ago`;
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) return `${interval}m ago`;
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) return `${interval}d ago`;
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) return `${interval}h ago`;
        interval = Math.floor(seconds / 60);
        if (interval >= 1) return `${interval}m ago`;
        return `${Math.floor(seconds)}s ago`;
    };

    return (
        <div className="chat-view-container">
            <div className="header">
                <h2>Chat List</h2>
                <button>
                    <Link to="/home">Home</Link>
                </button>
            </div>
            <div className="chat-view">
                <div className="search-bar">
                    <form className="search-form" onSubmit={handleSearchFriend}>
                        <input type="text" name="search-input" placeholder="Find a friend..." />
                        <button type="submit">Search</button>
                    </form>
                </div>
                <div className="conversations">
                    {(searchedFriend ? [searchedFriend] : friendDatas).map((friend) => {
                        const conversation = conversations?.find((conv) => 
                            conv.participants.includes(currentUser.id) && 
                            conv.participants.includes(friend.id)
                        );
                        const lastMessage = lastMessages?.find((m) => m?.id === conversation?.lastMessage);

                        return (
                            <div className="friend" key={friend.id} onClick={() => handleNavigate(friend.id)}>
                                <div className="friend-info">
                                    <img src={friend.avatar || "./default_avatar.jpg"} alt="avatar" />
                                    <div className="friend-details">
                                        <p className="friend-name">{friend.name}</p>
                                        <p className="last-message">
                                            {lastMessage ? (
                                                <>
                                                    <span className="message-text">{lastMessage.text}</span>
                                                    <span className="message-time">{timeSince(lastMessage.createdTime)}</span>
                                                </>
                                            ) : (
                                                <span className="message-text">Let send your first message!</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
