import "./chat-view.css";
import React from "react";
import { useUserStore } from "../../hooks/user-store";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import ChatController from "../../controllers/chat-controller";

export default function ChatView() {
    const navigate = useNavigate();
    const { currentUser, friendsData } = useUserStore();

    const handleBoxChat = async (friendId) => {
        const boxChatId = ChatController.getBoxChatId(currentUser.id, friendId).toString();
        
        if (await ChatController.exitBoxChat(boxChatId)) {
            return navigate(`/box-chat/${boxChatId}`);
        }
        else {
            await ChatController.createBoxChat(boxChatId);
    
            return navigate(`/box-chat/${boxChatId}`);
        }
    }
    
    return (
        <div className="chat-view">
            <div className="header">
                <h2>Chat list view</h2>
                <button >
                    <Link to="/home" >Home</Link>
                </button>
            </div>
            <div className="body">
                {friendsData?.map((friend) => (
                    <div className="friend" key={friend.id} onClick={() => handleBoxChat(friend.id)}>
                        <div className="infor">
                            <p>{friend.name}</p>
                            <img src={friend.avatar} alt={friend.name} />
                        </div>
                        <div className="state"> 
                            <p>Last message</p>
                            <p>2:00 PM</p>
                            <p>Seen</p>
                        </div>
                    </div>
                ))}
            </div>  
        </div>
    );
};