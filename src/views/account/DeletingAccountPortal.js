import React, { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import AuthenticationController from "../../controllers/authentication-controller";
import { auth } from "../../models/services/firebase";
import { useUserStore } from "../../hooks/user-store";

const DeletingAccountPortal = ({ setIsDeletingAccount, currentUser }) => {
    const [showWarning, setShowWarning] = useState(false);

    const { fetchUserInfo } = useUserStore();

    const handleDelete = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const password = formData.get("password");

        if (!password || password.length === 0) return;

        await AuthenticationController.logIn(auth?.currentUser?.email, password).then(() => {
            setShowWarning(true); // Hiển thị portal cảnh báo sau khi xác thực mật khẩu thành công
        }).catch((error) => {
            toast.error("Incorrect password. Please try again.");
            event.target.reset();
        });
    };

    const handleFinalDelete = async () => {
        await AuthenticationController.deleteAccount({ userId: currentUser?.id, avatar: currentUser?.avatar }).then(async () => {
            toast.success("Account deleted successfully!");
            await fetchUserInfo(null);
        }).catch((error) => {
            toast.error("Failed to delete account. Please try again.");
        });
    };

    const handleClickOutside = (event) => {
        const clickElement = event.target;
        if (!(clickElement.closest(".deleting-account .body"))) {
            setIsDeletingAccount(false);
        }
    };

    const handleWarningClickOutside = (event) => {
        const clickElement = event.target;
        if (!(clickElement.closest(".warning-account .body"))) {
            setShowWarning(false);
        }
    };

    return (
        <>
            {!showWarning ? (
                createPortal((
                    <div 
                        className="deleting-account fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center" 
                        onClick={handleClickOutside}
                    >
                        <div className="body bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
                            <h2 className="text-2xl font-bold text-black mb-6 text-center">Delete Account</h2>
                            <form onSubmit={handleDelete}>
                                <div className="input-container mb-4">
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Enter your password"
                                        className="input w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                                >
                                    Delete Account
                                </button>
                            </form>
                        </div>
                    </div>
                ), document.body)
            ) : (
                createPortal((
                    <div 
                        className="warning-account fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center" 
                        onClick={handleWarningClickOutside}
                    >
                        <div className="body bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                            <h2 className="text-2xl font-bold text-black mb-6 text-center">Are You Sure?</h2>
                            <p className="text-center mb-6">Deleting your account will remove all your data, including friends, messages, and photos. This action cannot be undone.</p>
                            <div className="flex justify-between">
                                <button 
                                    type="button" 
                                    className="w-2/5 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                                    onClick={handleFinalDelete}
                                >
                                    Confirm
                                </button>
                                <button 
                                    type="button" 
                                    className="w-2/5 bg-gray-300 text-black py-2 rounded-lg hover:bg-gray-400 transition"
                                    onClick={() => setShowWarning(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                ), document.body)
            )}
        </>
    );
};

export default DeletingAccountPortal;
