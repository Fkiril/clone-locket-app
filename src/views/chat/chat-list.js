import "./chat-list.css";
import React from "react";
import { useUserStore } from "../../hooks/user-store";

function ChatList(props) {
    const { setView } = props;
    const { currentUser } = useUserStore();
    
    return (
        <div className="container">
            <div className="header">
                <h2>Chat list view</h2>
                <button onClick={() => setView("home")}>Home</button>
            </div>

            <div className="body">
                <div className="item" >
                    <img src="./default_avatar.jpg" alt="avatar"></img>
                    <div className="texts">
                        <span>Nhan</span>
                        <p>Hello!</p>
                    </div>
                </div>
                <div className="item" >
                    <img src="./default_avatar.jpg" alt="avatar"></img>
                    <div className="texts">
                        <span>Tran</span>
                        <p>Hello!</p>
                    </div>
                </div>
                <div className="item" >
                    <img src="./default_avatar.jpg" alt="avatar"></img>
                    <div className="texts">
                        <span>KiriL</span>
                        <p>Hello!</p>
                    </div>
                </div>
                <div className="item" >
                    <img src="./default_avatar.jpg" alt="avatar"></img>
                    <div className="texts">
                        <span>BTran</span>
                        <p>Hello!</p>
                    </div>
                </div>
                <div className="item" >
                    <img src="./default_avatar.jpg" alt="avatar"></img>
                    <div className="texts">
                        <span>BTran</span>
                        <p>Hello!</p>
                    </div>
                </div>
                <div className="item" >
                    <img src="./default_avatar.jpg" alt="avatar"></img>
                    <div className="texts">
                        <span>BTran</span>
                        <p>Hello!</p>
                    </div>
                </div>
                <div className="item" >
                    <img src="./default_avatar.jpg" alt="avatar"></img>
                    <div className="texts">
                        <span>BTran</span>
                        <p>Hello!</p>
                    </div>
                </div>
                <div className="item" >
                    <img src="./default_avatar.jpg" alt="avatar"></img>
                    <div className="texts">
                        <span>BTran</span>
                        <p>Hello!</p>
                    </div>
                </div>
                <div className="item" >
                    <img src="./default_avatar.jpg" alt="avatar"></img>
                    <div className="texts">
                        <span>BTran</span>
                        <p>Hello!</p>
                    </div>
                </div>
                <div className="item" >
                    <img src="./default_avatar.jpg" alt="avatar"></img>
                    <div className="texts">
                        <span>BTran</span>
                        <p>Hello!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatList;