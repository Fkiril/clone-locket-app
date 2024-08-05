import React from "react";
import { createPortal } from "react-dom";
import UserController from "../../controllers/user-controller";
import { useUserStore } from "../../hooks/user-store";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const RequestsListPortal = ({ setIsShowingRequests }) => {
    const navigate = useNavigate();

    const { currentUser, requestDatas } = useUserStore();
    const userController = currentUser? new UserController(currentUser) : null;

    if (!currentUser) {
        toast.warning("You are not logged in. Please log in first.");
        return navigate("/");
    }

    const handleAccept = async (requestId) => {
        await userController.acceptFriendRequest(requestId).then(() => {
            toast.success("Friend request accepted successfully!");
        }).catch((error) => {
            toast.error("Failed to accept friend request. Please try again.");
        });
    };

    const handleDecline = async (requestId) => {
        await userController.declineFriendRequest(requestId).then(() => {
            toast.success("Friend request declined successfully!");
        }).catch((error) => {
            toast.error("Failed to decline friend request. Please try again.");
        });
    };

    const handleBlock = async (requestId) => {
        await userController.blockUser(requestId).then(() => {
            toast.success("User blocked successfully!");
        }).catch((error) => {
            toast.error("Failed to block user. Please try again.");
        });
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
                    {requestDatas?.map((request) => (
                        <div key={request?.id} className="request-card bg-gray-100 p-4 rounded-lg flex flex-col items-center w-48 shadow-md">
                            <img src={request?.avatar} alt="Avatar" className="w-24 h-24 rounded-full mb-2" />
                            <span className="text-lg font-semibold text-black mb-2">{request?.name}</span>
                            <div className="flex gap-2 mb-2">
                                <button
                                    className="accept-button px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-700 transition"
                                    onClick={() => handleAccept(request?.id)}>
                                    Accept
                                </button>
                                <button
                                    className="decline-button px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-700 transition"
                                    onClick={() => handleDecline(request?.id)}>
                                    Decline
                                </button>
                            </div>
                            <button
                                className="block-button px-4 py-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-700 transition"
                                onClick={() => handleBlock(request?.id)}>
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
