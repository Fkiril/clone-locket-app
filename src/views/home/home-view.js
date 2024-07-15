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
                <button>
                    <Link to="/account">Account</Link>
                </button>
                <button>
                    <Link to="/chat">Chat</Link>
                </button>
            </div>
        </div>
    );
}