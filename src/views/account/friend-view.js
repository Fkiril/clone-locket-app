import React from "react";
import ReactDOM from "react-dom";
import "./friend-view.css"; // Import the CSS file

const FriendView = ({ friendsData, onClose }) => {
    const handleClickOutside = (event) => {
        if (!event.target.closest(".friend-view-container")) {
            onClose();
        }
    };

    return ReactDOM.createPortal(
        <div className="friend-view-container fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center" onClick={handleClickOutside}>
            <div className="friend-view-content bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold mb-4">Friends List</h3>
                <div className="friends-list">
                    {friendsData.length === 0 ? (
                        <p>No friends found.</p>
                    ) : (
                        friendsData.map((friend) => (
                            <div key={friend.id} className="friend-item flex items-center mb-4">
                                <img src={friend.avatar} alt={friend.name} className="w-12 h-12 rounded-full mr-4" />
                                <span>{friend.name}</span>
                            </div>
                        ))
                    )}
                </div>
                <button className="close-btn mt-4 bg-red-500 text-white px-4 py-2 rounded-lg" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>,
        document.body
    );
};

export default FriendView;
