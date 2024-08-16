import "./chat-view.css";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useUserStore } from "../../hooks/user-store";
import { useChatListStore } from "../../hooks/chat-list-store";
import { useInternetConnection } from "../../hooks/internet-connection";

import ChatController from "../../controllers/chat-controller";

import DisconnectionPortal from "../disconnection/disconnection-portal";

export default function ChatView() {
    const navigate = useNavigate();
    
    const { connectionState } = useInternetConnection();
    const { currentUser, friendDatas } = useUserStore();
    const { chatManager, conversations, lastMessages } = useChatListStore();
    const [searchedFriend, setSearchedFriend] = useState(null);

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
            const friends = [];
            for (const friend of friendDatas) {
                if (emailRegex.test(searchInput)) {
                    if (friend.email === searchInput) {
                        friends.push(friend);
                    }
                } else {
                    if (friend.name.toLowerCase().includes(searchInput.toLowerCase())) {
                        friends.push(friend);
                    }
                }
            }
            if (friends.length > 0) {   
                setSearchedFriend(friends);
            } else {
                toast.warning("No friend found with this email or name.");
                setSearchedFriend(null);
            }
        }
        event.target.reset();
    }

    const handleClearSearch = (event) => {
        event.preventDefault();
        setSearchedFriend(null);
    }

    const formatTime = (date) => {
        const options = { hour: '2-digit', minute: '2-digit', hour12: true };
        return new Date(date).toLocaleTimeString([], options);
    };

    const friendAndConversations = useMemo(() => {
        return friendDatas.map(friend => {
            const conversation = conversations?.find(conv => 
                conv.participants.includes(currentUser.id) && 
                conv.participants.includes(friend.id)
            );
            const lastMessage = lastMessages?.find(m => m?.id === conversation?.lastMessage);
            const unreadCount = chatManager?.conversationStates?.[conversation?.id] || 0;

            return {
                ...friend,
                conversation,
                lastMessage,
                unreadCount
            };
        });
    }, [friendDatas, conversations, lastMessages, chatManager]);
    
    const filtered = useMemo(() => {
        return friendAndConversations.filter(friend => {
            if (searchedFriend) {
                return searchedFriend.find(f => f.id === friend.id);
            }
            else return friend.conversation !== undefined;
        })
    }, [searchedFriend, friendAndConversations]);
    
    const handleRouting = (path) => {
        navigate(path);
    }

    return (
        <>
            {!connectionState && <DisconnectionPortal />}
            <div className="chat-view-container">
                <div className="chat-header">
                    <h2>Chat List</h2>
                    <button onClick={() => handleRouting("/home")}>
                        <div className="home-icon"></div>
                    </button>
                </div>
                <div className="chat-view">
                    <div className="search-bar">
                        <form className="search-form" onSubmit={searchedFriend? handleClearSearch : handleSearchFriend}>
                            <input type="text" name="search-input" placeholder="Find a friend..." />
                            <button type="submit">
                                <div className="search-icon"></div>
                            </button>
                        </form>
                    </div>
                    <div className="conversations">
                        {filtered
                            .sort((a, b) => new Date(b.lastMessage?.createdTime) - new Date(a.lastMessage?.createdTime))
                            .map(friend => (
                                <div className="friend" key={friend.id} onClick={() => handleNavigate(friend.id)}>
                                    <div className="friend-info">
                                        <div className="friend-avatar">
                                            <img src={friend.avatarFileUrl || friend.avatar || "./default_avatar.jpg"} alt="avatar" />
                                        </div>
                                        <div className="friend-details">
                                            <p className="friend-name">{friend.name}</p>
                                            <p className="last-message">
                                                <span className="message-text">{friend.lastMessage?.senderId === currentUser.id ? "You: " : null}{friend.lastMessage?.text}</span>
                                                <span className="message-time">{friend.lastMessage? formatTime(friend.lastMessage?.createdTime) : null}</span>
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
        </>
    );
}
