import React from "react";
import { Link } from "react-router-dom";
import { useUserStore } from "../../hooks/user-store"; 
import "./home-view.css";

export default function HomeView() {
    const { currentUser } = useUserStore();
    const avatarUrl = currentUser?.avatar ? currentUser.avatar : "./default_avatar.jpg"; 

    return (
        <div className="home min-h-screen flex flex-col items-center bg-gray-100">
            <div className="header-container text-center mb-8">
                <h1 className="app-title">Clone-locket</h1>
                <p className="app-subtitle">Clone-locket - Connect and share with your friends and family</p>
            </div>
            <div className="body flex flex-col items-center gap-4">
                <Link to="/account" className="avatar-container">
                    <img src={avatarUrl} alt="User Avatar" className="user-avatar" />
                </Link>
                <div className="nav-buttons flex gap-4">
                    <button className="nav-button">
                        <Link to="/chat">Chat</Link>
                    </button>
                    <button className="nav-button">
                        <Link to="/upload-picture">Upload a picture</Link>
                    </button>
                </div>
            </div>
        </div>
    );
}
