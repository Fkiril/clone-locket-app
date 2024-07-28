import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import UserController from "../../controllers/user-controller";
import { useUserStore } from "../../hooks/user-store";

const RequestsListPortal = ({ currentUser, setIsShowingRequests }) => {
    const [requestsInfo, setRequestsInfo] = useState([]);
    const userController = new UserController(currentUser);
    const { blockUser } = useUserStore();

    useEffect(() => {
        const fetchRequestsInfo = async () => {
            if (currentUser?.friendRequests) {
                const info = await userController.getUsersInfoByIds(currentUser.friendRequests);
                setRequestsInfo(info);
            }
        };
        fetchRequestsInfo();
    }, [currentUser]);

    const handleAccept = async (requestId) => {
        await userController.acceptFriendRequest(requestId);
        // Remove the request from the list
        setRequestsInfo((prev) => prev.filter((request) => request.id !== requestId));
    };

    const handleDecline = async (requestId) => {
        await userController.declineFriendRequest(requestId);
        // Remove the request from the list
        setRequestsInfo((prev) => prev.filter((request) => request.id !== requestId));
    };

    const handleBlock = async (requestId) => {
        await blockUser(requestId);
        // Remove the request from the list
        setRequestsInfo((prev) => prev.filter((request) => request.id !== requestId));
    };

    const handleClickOutside = (event) => {
        const clickElement = event.target;
        if (!(clickElement.closest(".requests-list .body"))) {
            setIsShowingRequests(false);
        }
    };

    return createPortal((
        <div className="requests-list fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center" onClick={handleClickOutside}>
            <div className="body bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
                <h2 className="text-2xl font-bold mb-6 text-center">Requests</h2>
                <div className="flex flex-wrap gap-4 justify-center">
                    {requestsInfo.map((request) => (
                        <div key={request.id} className="request-card bg-gray-100 p-4 rounded-lg flex flex-col items-center w-48 shadow-md">
                            <img src={request.avatar} alt="Avatar" className="w-24 h-24 rounded-full mb-2" />
                            <span className="text-lg font-semibold text-black mb-2">{request.userName}</span>
                            <div className="flex gap-2 mb-2">
                                <button
                                    className="accept-button px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-700 transition"
                                    onClick={() => handleAccept(request.id)}>
                                    Accept
                                </button>
                                <button
                                    className="decline-button px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-700 transition"
                                    onClick={() => handleDecline(request.id)}>
                                    Decline
                                </button>
                            </div>
                            <button
                                className="block-button px-4 py-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-700 transition"
                                onClick={() => handleBlock(request.id)}>
                                Block
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    ), document.body);
};

export default RequestsListPortal;
