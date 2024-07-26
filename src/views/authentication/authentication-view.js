import "./authentication-view.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthenticationController from "../../controllers/authentication-controller";
import { useUserStore } from "../../hooks/user-store";

export default function AuthenticationView() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { currentUser } = useUserStore();

    useEffect(() => {
        if (currentUser) navigate("/home");
    }, [currentUser]);

    const _logIn = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData);
        await AuthenticationController.logIn(email, password);

        setIsLoading(false);

        navigate("/home");
    }

    const _createAccount = async (e) => {
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
                <h1 className="app-title">Locket</h1>
                <p className="app-subtitle">Locket giúp bạn kết nối và chia sẻ với mọi người trong cuộc sống của bạn.</p>
            </div>
            <div className="item-container flex bg-white p-8 rounded-lg shadow-md w-full max-w-4xl gap-8">
                <div className="item flex-1">
                    <h2 className="text-2xl font-bold mb-6 text-center">Welcome to Locket</h2>
                    <form onSubmit={_logIn} className="flex flex-col gap-4">
                        <input className="input" type="text" placeholder="Email" name="email" />
                        <input className="input" type="password" placeholder="Password" name="password" />
                        <button className="button" disabled={isLoading}>
                            {isLoading ? "Loading..." : "Sign In"}
                        </button>
                    </form>
                </div>

                <div className="separator"></div>

                <div className="item flex-1">
                    <h2 className="text-2xl font-bold mb-6 text-center">Create your Locket Account</h2>
                    <form onSubmit={_createAccount} className="flex flex-col gap-4">
                        <input className="input" type="text" placeholder="Username" name="userName" />
                        <input className="input" type="text" placeholder="Email" name="email" />
                        <input className="input" type="password" placeholder="Password" name="password" />
                        <input className="input" type="password" placeholder="Confirm Password" name="confirmPassword" />
                        <button className="button" disabled={isLoading}>
                            {isLoading ? "Loading..." : "Sign Up"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
