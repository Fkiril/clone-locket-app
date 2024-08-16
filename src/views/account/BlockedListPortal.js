import React from "react";
import { createPortal } from "react-dom";
import UserController from "../../controllers/user-controller"; 
import { useUserStore } from "../../hooks/user-store";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth } from "../../models/services/firebase";

const BlockedListPortal = ({ setIsShowingBlocked }) => {
    const navigate = useNavigate();

    const { currentUser, blockedDatas, fetchUserInfo, nearestFetchUserInfo } = useUserStore(); 
    const userController = currentUser? new UserController(currentUser) : null;

    if (!currentUser) {
        toast.warning("You are not logged in. Please log in first.");
        return navigate("/");
    }

    const handleReFetch = async () => {
        const now = new Date().getTime();
        if (now - nearestFetchUserInfo > 5000) {
            await fetchUserInfo(auth?.currentUser?.uid);
        }
    };
    
    const handleClickOutside = (event) => {
        const clickElement = event.target;
        if (!(clickElement.closest(".blocked-list .body"))) {
            setIsShowingBlocked(false);
        }
    };

    const handleUnblockUser = async (userId) => {
        await userController.unblockUser(userId).then(async () => {
            toast.success("User unblocked successfully");
            await handleReFetch();
            setIsShowingBlocked(false);
        }).catch((error) => {
            toast.error("Failed to unblock user. Please try again.");
        });
    };

    return createPortal((
        <div className="blocked-list fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center" onClick={handleClickOutside}>
            <div className="body bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">Blocked Users</h2>
                <div className="flex flex-wrap gap-4">
                    {blockedDatas?.map(user => (
                        <div key={user?.id} className="blocked-card bg-gray-100 p-4 rounded-lg flex flex-col items-center">
                            <img src={user?.avatar || "./default_avatar.jpg"} alt="Avatar" className="w-16 h-16 rounded-full mb-2" />
                            <span className="text-lg font-semibold text-black">{user?.name}</span>
                            <button
                                className="unblock bg-green-500 text-white px-2 py-1 rounded-lg mt-2"
                                onClick={() => handleUnblockUser(user?.id)}>
                                Unblock
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    ), document.body);
};

export default BlockedListPortal;
