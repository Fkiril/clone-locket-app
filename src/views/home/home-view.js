import React from "react";
import { Link } from "react-router-dom";
import "./home-view.css";

export default function HomeView() {
    return (
        <div className="home min-h-screen flex flex-col items-center bg-gray-100">
            <div className="header-container text-center mb-8">
                <h1 className="app-title">Clone-locket</h1>
                <p className="app-subtitle">Clone-locket - Connect and share with your friends and family</p>
            </div>
            <div className="body flex justify-center gap-4">
                <button className="nav-button" onClick={() => document.getElementById("account").click()}>
                    <Link id="account" to="/account">Account</Link>
                </button>
                <button className="nav-button" onClick={() => document.getElementById("chat").click()}>
                    <Link id="chat" to="/chat">Chat</Link>
                </button>
                <button className="nav-button" onClick={() => document.getElementById("upload-picture").click()}>
                    <Link id="upload-picture" to="/upload-picture">Upload a picture</Link>
                </button>
            </div>
        </div>
    );
}
