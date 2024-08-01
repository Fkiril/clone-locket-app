import React from "react";
import { Link } from "react-router-dom";
import { useUserStore } from "../../hooks/user-store";
import "./home-view.css";

export default function HomeView() {
	const { currentUser } = useUserStore();
	const avatarUrl = currentUser?.avatar ? currentUser.avatar : "./default_avatar.jpg";

	return (
		<div className="home min-h-screen flex flex-col items-center bg-gray-100">
			<div className="header-container text-center mb-1">
				<h1 className="app-title">Clone-locket</h1>
				<p className="app-subtitle">Clone-locket - Connect and share with your friends and family</p>
			</div>
			<div className="nav-buttons-container mb-1">
				<Link to="/chat" className="nav-buttons">
					Chat
				</Link>
				<Link to="/upload-picture" className="nav-buttons">
					Upload a picture
				</Link>
				<Link to="/account" className="avatar-container">
					<img src={avatarUrl} alt="User Avatar" className="user-avatar" />
				</Link>
			</div>
		</div>
	);
}