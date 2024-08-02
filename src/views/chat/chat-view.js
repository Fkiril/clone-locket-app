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

    const formatTime = (date) => {
        const options = { hour: '2-digit', minute: '2-digit', hour12: true };
        return new Date(date).toLocaleTimeString([], options);
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
                    {(searchedFriend ? [searchedFriend] : friendDatas)
                        .map(friend => ({
                            ...friend,
                            conversation: conversations?.find(conv => 
                                conv.participants.includes(currentUser.id) && 
                                conv.participants.includes(friend.id)
                            ),
                            lastMessage: lastMessages?.find(m => m?.id === conversations?.find(conv => 
                                conv.participants.includes(currentUser.id) && 
                                conv.participants.includes(friend.id)
                            )?.lastMessage),
                            unreadCount: lastMessages?.filter(m => 
                                m?.senderId === friend.id && 
                                !m?.readBy?.includes(currentUser.id)
                            ).length
                        }))
                        .filter(friend => friend.conversation && friend.lastMessage)
                        .sort((a, b) => new Date(b.lastMessage?.createdTime) - new Date(a.lastMessage?.createdTime))
                        .map(friend => (
                            <div className="friend" key={friend.id} onClick={() => handleNavigate(friend.id)}>
                                <div className="friend-info">
                                    <img src={friend.avatar || "./default_avatar.jpg"} alt="avatar" />
                                    <div className="friend-details">
                                        <p className="friend-name">{friend.name}</p>
                                        <p className="last-message">
                                            <span className="message-text">{friend.lastMessage?.text}</span>
                                            <span className="message-time">{formatTime(friend.lastMessage?.createdTime)}</span>
                                        </p>
                                        {friend.unreadCount > 0 && (
                                            <span className="unread-count">{friend.unreadCount}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )) || null}
                </div>
            </div>
        </div>
    );
}
