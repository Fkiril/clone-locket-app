import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserStore } from "../../hooks/user-store";
import { useChatListStore } from "../../hooks/chat-list-store";
import ChatController from "../../controllers/chat-controller";
import { toast } from "react-toastify";
import { onSnapshot } from "firebase/firestore";
import { getDocRef } from "../../models/utils/firestore-method";
import "./chat-view.css";

export default function ChatView() {
    const navigate = useNavigate();
    const [state, setState] = useState(useLocation().state);

    const { currentUser, friendDatas } = useUserStore();
    const { conversations, lastMessages, fetchLastMessages } = useChatListStore();
    const [searchedFriend, setSearchedFriend] = useState(null);

    useEffect(() => {
        if (state?.routing && lastMessages) {
            setState(null);
        } else {
            const docRef = getDocRef("chatManagers", currentUser?.id);
            const unSubscribe = onSnapshot(docRef, { includeMetadataChanges: false }, () => {
                fetchLastMessages(currentUser?.id);
                console.log("ChatView: useEffect() for fetchLastMessages: ", lastMessages);
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
        navigate(`/conversation/${conversationId}`, { state: { routing: true } });
    }

    const handleSearchFriend = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const searchInput = formData.get("search-input");
        if (!searchInput) {
            setSearchedFriend(null);
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const friend = friendDatas.find((friend) =>
                emailRegex.test(searchInput) ? friend.email === searchInput : friend.name.toLowerCase().includes(searchInput.toLowerCase())
            );
            if (friend) {
                setSearchedFriend(friend);
            } else {
                toast.info("No friend found with this email or name.");
                setSearchedFriend(null);
            }
        }
        event.target.reset();
    }

    const formatTime = (date) => {
        const options = { hour: '2-digit', minute: '2-digit', hour12: true };
        return new Date(date).toLocaleTimeString([], options);
    };

    const filteredFriends = searchedFriend ? [searchedFriend] : friendDatas;

    const friendsWithConversations = filteredFriends.map(friend => {
        const conversation = conversations?.find(conv =>
            conv.participants.includes(currentUser.id) &&
            conv.participants.includes(friend.id)
        );
        const lastMessage = lastMessages?.find(m => m?.id === conversation?.lastMessage);
        const unreadCount = lastMessages?.filter(m =>
            m?.senderId === friend.id &&
            !m?.readBy?.includes(currentUser.id)
        ).length;

        return {
            ...friend,
            conversation,
            lastMessage,
            unreadCount
        };
    }).filter(friend => friend.conversation);

    const handleRouting = (path) => {
        navigate(path, { state: { routing: true } });
    }

    return (
        <div className="chat-view-container">
            <div className="chat-header">
                <h2>Chat List</h2>
                <button onClick={() => handleRouting("/home")}>
                    <div className="home-icon"></div>
                </button>
            </div>
            <div className="chat-view">
                <div className="search-bar">
                    <form className="search-form" onSubmit={handleSearchFriend}>
                        <input type="text" name="search-input" placeholder="Find a friend..." />
                        <button type="submit">
                            <div className="search-icon"></div>
                        </button>
                    </form>
                </div>
                <div className="conversations">
                    {friendsWithConversations
                        .sort((a, b) => new Date(b.lastMessage?.createdTime) - new Date(a.lastMessage?.createdTime))
                        .map(friend => (
                            <div className="friend" key={friend.id} onClick={() => handleNavigate(friend.id)}>
                                <div className="friend-info">
                                    <div className="friend-avatar">
                                        <img src={friend.avatar || "./default_avatar.jpg"} alt="avatar" />
                                    </div>
                                    <div className="friend-details">
                                        <p className="friend-name">{friend.name}</p>
                                        <p className="last-message">
                                            <span className="message-text">{friend.lastMessage?.text}</span>
                                            <span className="message-time">{formatTime(friend.lastMessage?.createdTime)}</span>
                                        </p>
                                        {friend.unreadCount > 0 && (
                                            <div className="unread-count">
                                                <span>{friend.unreadCount}</span>
                                            </div>
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
