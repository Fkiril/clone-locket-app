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
    const { currentUser, friendsData } = useUserStore();
    const { conversations, lastMessages, fetchLastMessages } = useChatListStore();

    useEffect(() => {
        if (currentUser) {
            const docRef = getDocRef("chatMangers", currentUser.id);
            const unSubscribe = onSnapshot(docRef, { includeMetadataChanges: false }, () => {
                console.log("chat-view.js: useEffect() for onSnapshot()");
                fetchLastMessages(currentUser.id);
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

    const handleGetFriendId = async (conversationId) => {
        console.log("handleGetFriendId", conversationId);
        return await ChatController.getFriendIdByConversationId(currentUser.id, conversationId);
    }

    console.log("currentUser", currentUser);
    console.log("friendsData", friendsData);
    console.log("conversations", conversations);
    console.log("lastMessages", lastMessages);

    return (
        <div className="chat-view">
            <div className="header">
                <h2>Chat list view</h2>
                <button>
                    <Link to="/home" >Home</Link>
                </button>
            </div>
            <div className="body">
                {/* {friendsData.map((friend) => (
                    <div className="friend" key={friend.id}
                        onClick={() => handleNagigate(friend.id)}
                    >
                        <img src={friend.avatar? friend.avatar : "./default_avatar.jpg"} alt="avatar" />
                        <p>{friend.name}</p>
                    </div>
                ))} */}
                {conversations?.map((conversation) => {
                    if (conversation.participants.length == 2) {
                        const friendId = conversation.participants.find((participant) => participant !== currentUser.id);
                        console.log("friendId", friendId);
                        const friend = friendsData.find((friend) => friend.id === friendId);
                        console.log("friend", friend);
                        return (
                            <div className="friend" key={conversation.id}
                                onClick={() => handleNagigate(friendId)}
                            >
                                <img src={friend?.avatar? friend.avatar : "./default_avatar.jpg"} alt="avatar" />
                                <p>{friend?.name}</p>
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
                
        </div>
    );
};