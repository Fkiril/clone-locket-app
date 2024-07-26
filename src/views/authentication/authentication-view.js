import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthenticationController from "../../controllers/authentication-controller";
import { useUserStore } from "../../hooks/user-store";
import "./authentication-view.css";

export default function AuthenticationView() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showLogin, setShowLogin] = useState(true);
    const { currentUser } = useUserStore();
    const [isChecking, setIsChecking] = useState(true);
    useEffect(() => {
        const checkCurrentUser = () => {
            if (currentUser) {
                setIsChecking(false);
                navigate("/home");
            }
            else {
                setTimeout(() => {
                    setIsChecking(false);
                }, 2000);
            }
            return () => {};
        };

        const cleanup = checkCurrentUser();
        return cleanup;
    }, [currentUser, navigate]);


    const handleLogIn = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData);
        await AuthenticationController.logIn(email, password);

        if (currentUser) navigate("/home");
        setIsLoading(false);
    }

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.target);
        const { userName, email, password, confirmPassword } = Object.fromEntries(formData);
        await AuthenticationController.createAccount(userName, email, password, confirmPassword);

        setIsLoading(false);
    }

    return (
        <div className="authentication min-h-screen flex items-center justify-center bg-gray-100">
        <div className="header-container text-center mb-8">
            <h1 className="app-title">Clone Locket</h1>
            <p className="app-subtitle">Locket giúp bạn kết nối và chia sẻ với mọi người trong cuộc sống của bạn.</p>
        </div>
        {isChecking ? (
            <div className="checking">Checking...</div>
        ) : (
        <div className="flex flex-col items-center">
            <div className="flex justify-center mb-5">
                <button
                    onClick={() => setShowLogin(true)}
                    className={`px-4 py-2 mx-2 ${showLogin ? "font-bold" : ""}`}
                >
                    Đăng Nhập
                </button>
                <button
                    onClick={() => setShowLogin(false)}
                    className={`px-4 py-2 mx-2 ${!showLogin ? "font-bold" : ""}`}
                >
                    Đăng ký
                </button>
            </div>

            {showLogin ? (
                <div className="w-80 mb-5">
                    
                    <form onSubmit={handleLogIn} className="flex flex-col">
                        <input type="text" placeholder="Email" name="email" required className="mb-3 p-2 border rounded"/>
                        <input type="password" placeholder="Password" name="password" required className="mb-3 p-2 border rounded"/>
                        <button disabled={isLoading} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700">
                            {isLoading ? "Loading" : "Đăng nhập"}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="w-80 mb-5">
                    <form onSubmit={handleCreateAccount} className="flex flex-col">
                        <input type="text" placeholder="Username" name="userName" required className="mb-3 p-2 border rounded"/>
                        <input type="text" placeholder="Email" name="email" required className="mb-3 p-2 border rounded"/>
                        <input type="password" placeholder="Password" name="password" required className="mb-3 p-2 border rounded"/>
                        <input type="password" placeholder="Confirm Password" name="confirmPassword" required className="mb-3 p-2 border rounded"/>
                        <button disabled={isLoading} className="p-2 bg-green-500 text-white rounded hover:bg-green-700">
                            {isLoading ? "Loading" : "Đăng ký"}
                        </button>
                    </form>
                </div>
            )}
        </div>
        )}
        </div>
    );
}
