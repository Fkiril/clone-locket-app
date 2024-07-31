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

    const [ searchedFriend, setSearchedFriend ] = useState(null);

    useEffect(() => {
        if (currentUser) {
            const docRef = getDocRef("chatMangers", currentUser.id);
            const unSubscribe = onSnapshot(docRef, { includeMetadataChanges: false }, () => {
                fetchLastMessages(currentUser.id);
                console.log("chat-view.js: useEffect() for onSnapshot()");
                console.log("Conversations: ", conversations);
                console.log("LastMessages: ", lastMessages);
            });
            
            return () => {
                unSubscribe();
            }
        }
    }, [onSnapshot]);

    const handleNagigate = async (friendId) => {
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
        console.log("searchInput",searchInput);

        if (!searchInput) {
            toast.warning("Please enter a search input");
        }
        else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(searchInput)) {
                // searchInput is an email
                console.log("searchInput is an email");
                const friend = friendDatas.find((friend) => friend.email === searchInput);
                if (friend) {
                    console.log("friend", friend);
                    setSearchedFriend(friend);
                }
            } else {
                // searchInput is not an email
                console.log("searchInput is not an email");
                const friend = friendDatas.find((friend) => friend.name === searchInput);
                if (friend) {
                    console.log("friend", friend);
                    setSearchedFriend(friend);
                }
            }
        }
        event.target.reset();
    }

    return (
        <div className="chat-view">
            <div className="header">
                <h2>Chat list view</h2>
                <button>
                    <Link to="/home" >Home</Link>
                </button>
            </div>
            <div className="body">
                <div className="conversations">
                    {conversations?.map((conversation) => {
                        if (conversation.participants.length === 2) {
                            const friendId = conversation.participants.find((participant) => participant !== currentUser.id);
                            const friend = friendDatas.find((friend) => friend.id === friendId);
                            const lastMessage = lastMessages.find((m) => m?.id === conversation.lastMessage);
                            return (
                                <div className="friend" key={conversation.id}
                                    onClick={() => handleNagigate(friendId)}
                                >
                                    <div className="friend-info">
                                        <img src={friend?.avatar? friend.avatar : "./default_avatar.jpg"} alt="avatar" />
                                        <p>{friend?.name}</p>
                                    </div>
                                    {(lastMessage)? (
                                        <div className="last-message">
                                            <p>{lastMessage.text}</p>
                                            <p>{lastMessage.createdTime}</p>
                                        </div>
                                    ) : null}
                                </div>
                            );
                        }
                        else {
                            return (
                                <div className="group" key={conversation.id}>
                                </div>
                            )
                        }
                    })}
                </div>
                <div className="search-bar">
                    <form
                        className="search-form"
                        onSubmit={handleSearchFriend}
                    >
                        <input
                            type="text"
                            name="search-input"
                            placeholder="Find a friend..."
                        />
                        <button type="submit">Search</button>
                    </form>
                </div>
                <div className="search-result">
                    {searchedFriend? (
                        <div className="friend-info">
                            <img src={searchedFriend?.avatar? searchedFriend.avatar : "./default_avatar.jpg"} alt="avatar" />
                            <p>{searchedFriend?.name}</p>
                        </div>
                    ) : null}
                </div>
            </div>  
                
        </div>
    );
};