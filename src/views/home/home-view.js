import "./home-view.css";
import React from "react";
import { Link } from "react-router-dom";

export default function HomeView() {
    return (
        <div className="home">
            <div className="header">
                <h2>Home view</h2>
            </div>
            <div className="body">
                <button onClick={() => document.getElementById("account").click()}>
                    <Link id="account" to="/account">Account</Link>
                </button>
                <button onClick={() => document.getElementById("chat").click()}>
                    <Link id="chat" to="/chat">Chat</Link>
                </button>
                <button onClick={() => document.getElementById("upload-picture").click()}>
                    <Link id="upload-picture" to="/upload-picture">Upload a picture</Link>
                </button>
            </div>
        </div>
    );
}