import "./chat-view.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onSnapshot } from "firebase/firestore";
import { getDocRef } from "../../models/utils/firestore-method";
import { useUserStore } from "../../hooks/user-store";
import { useChatListStore } from "../../hooks/chat-list-store";
import ChatController from "../../controllers/chat-controller";
import { toast } from "react-toastify";

export default function ChatView() {
    const navigate = useNavigate();
    
    const { currentUser, friendDatas } = useUserStore();
    const { chatManager, conversations, lastMessages, fetchLastMessages } = useChatListStore();
    const [searchedFriend, setSearchedFriend] = useState(null);

    const [newMessageAt, setNewMessageAt] = useState([]);

    useEffect(() => {
        const docRef = getDocRef("chatManagers", currentUser?.id);
        const unSubscribe = onSnapshot(docRef, { includeMetadataChanges: false }, async () => {
            await fetchLastMessages(currentUser?.id);
            if (chatManager) {
                Object.keys(chatManager.conversationStates).forEach(key => {
                    const state = chatManager.conversationStates[key];
                    if (state > 0) {
                        setNewMessageAt(prev => [...prev, key]);
                    }
                })
            }
            console.log("ChatView: useEffect() for fetchLastMessages");
        });

        return () => {
            unSubscribe();
        }
    }, [currentUser, fetchLastMessages]);

    const handleNavigate = async (friendId) => {
        let conversationId = await ChatController.getConversationIdWithFriend(currentUser.id, friendId);
        if (!conversationId) {
            conversationId = await ChatController.createConversation([currentUser.id, friendId]);
        }
        if (newMessageAt.includes(conversationId)) {
            navigate(`/conversation/${conversationId}`, { state: { routing: true, newMessage: true } });
        }
        else {
            navigate(`/conversation/${conversationId}`, { state: { routing: true } });
        }
    }

    const handleSearchFriend = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const searchInput = formData.get("search-input");
        if (!searchInput) {
            setSearchedFriend(null);
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            // const friends = friendDatas.filter((friend) => 
            //     emailRegex.test(searchInput)? friend.email.toLowerCase().includes(searchInput.toLowerCase()) : friend.name.toLowerCase().includes(searchInput.toLowerCase()));
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
                console.log("searchedFriend: ", searchedFriend);
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

    const friendAndConversations = friendDatas.map(friend => {
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
    const filtered = friendAndConversations.filter(friend => {
        if (searchedFriend) {
            return searchedFriend.find(f => f.id === friend.id);
        }
        else return friend.conversation !== undefined;
    })
    console.log("filtered: ", filtered);
    
    const handleRouting = (path) => {
        navigate(path, { state: { routing: true } });
    }

    return (
        <div className="chat-view-container">
            <div className="header">
                <h2>Chat List</h2>
                <button onClick={() => handleRouting("/home")}>
                    Home
                </button>
            </div>
            <div className="chat-view">
                <div className="search-bar">
                    <form className="search-form" onSubmit={searchedFriend? handleClearSearch : handleSearchFriend}>
                        <input type="text" name="search-input" placeholder="Find a friend..." />
                        <button type="submit">{searchedFriend? "Clear" : "Search"}</button>
                    </form>
                </div>
                <div className="conversations">
                    {filtered
                        .sort((a, b) => new Date(b.lastMessage?.createdTime) - new Date(a.lastMessage?.createdTime))
                        .map(friend => (
                            <div className="friend" key={friend.id} onClick={() => handleNavigate(friend.id)}>
                                <div className="friend-info">
                                    <img src={friend.avatar || "./default_avatar.jpg"} alt="avatar" />
                                    <div className="friend-details">
                                        <p className="friend-name">{friend.name}</p>
                                        <p className="last-message">
                                            <span className="message-text">{friend.lastMessage?.text}</span>
                                            <span className="message-time">{friend.lastMessage? formatTime(friend.lastMessage?.createdTime) : null}</span>
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