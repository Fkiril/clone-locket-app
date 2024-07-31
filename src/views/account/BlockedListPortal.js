import React from "react";
import { createPortal } from "react-dom";
import UserController from "../../controllers/user-controller"; 
import { useUserStore } from "../../hooks/user-store";

const BlockedListPortal = ({ setIsShowingBlocked }) => {
    const { currentUser, blockedDatas } = useUserStore(); 
    const userController = currentUser? new UserController(currentUser) : null;
    
    const handleClickOutside = (event) => {
        const clickElement = event.target;
        if (!(clickElement.closest(".blocked-list .body"))) {
            setIsShowingBlocked(false);
        }
    };

    const handleUnblockUser = async (userId) => {
        if (userController) {
            await userController.unblockUser(userId);
            setIsShowingBlocked(false);
        }
    };

    return createPortal((
        <div className="blocked-list fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center" onClick={handleClickOutside}>
            <div className="body bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">Blocked Users</h2>
                <div className="flex flex-wrap gap-4">
                    {blockedDatas?.map(user => (
                        <div key={user?.id} className="blocked-card bg-gray-100 p-4 rounded-lg flex flex-col items-center">
                            <img src={user?.avatar} alt="Avatar" className="w-16 h-16 rounded-full mb-2" />
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
