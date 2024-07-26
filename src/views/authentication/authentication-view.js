import "./authentication-view.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthenticationController from "../../controllers/authentication-controller";
import { useUserStore } from "../../hooks/user-store";
// import TextField from '@mui/material/TextField';
// import MetaData from '../Layouts/MetaData';
export default function AuthenticationView() {
    const navigate = useNavigate();

    const { currentUser } = useUserStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkCurrentUser = () => {
            console.log("authentication-view.js: useEffect() for checkCurrentUser: ", currentUser);
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
    const [isLoading, setIsLoading] = useState(false);

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
        <div className="authentication">
            <div className="header">
                <h1>Locket</h1>
            </div>
            {isChecking? (
                <div className="checking">Checking...</div>
            ) : (
                <div className="body">
                    <div className="item">
                        <h2>Welcome to Locket</h2>
                        <form onSubmit={handleLogIn}>
                            <input type="text" placeholder="Email" name="email" />
                            <input type="password" placeholder="Password" name="password" />
                            <button disabled={isLoading}>{isLoading ? "Loading..." : "Sign In"}</button>
                        </form>
                    </div>

                    <div className="separator"></div>

                    <div className="item">
                        <h2>Create your Locket Account</h2>
                        <form onSubmit={handleCreateAccount}>
                            <input type="text" placeholder="Username" name="userName" />
                            <input type="text" placeholder="Email" name="email" />
                            <input type="password" placeholder="Password" name="password" />
                            <input type="password" placeholder="Confirm Password" name="confirmPassword" />
                            <button disabled={isLoading}>{isLoading ? "Loading..." : "Sign Up"}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
