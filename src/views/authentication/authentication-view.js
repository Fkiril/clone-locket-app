import "./authentication-view.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthenticationController from "../../controllers/authentication-controller";

export default function AuthenticationView() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

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
        const { userName, email, password, comfirmPassword } = Object.fromEntries(formData);
        await AuthenticationController.createAccount(userName, email, password, comfirmPassword);

        setIsLoading(false);
    }
    
    return (
        <div className="authentication">
            <div className="item">
                <h2>Welcome back</h2>
                <form onSubmit={_logIn}>
                    <input type="text" placeholder="Email" name="email" />
                    <input type="password" placeholder="Password" name="password" />
                    <button disabled={isLoading}>{isLoading ? "Loading" : "Sign In"}</button>
                </form>
            </div>

            <div className="separator"></div>

            <div className="item">
                <h2>Create an Account</h2>
                <form onSubmit={_createAccount}>
                    <input type="text" placeholder="Username" name="userName" />
                    <input type="text" placeholder="Email" name="email" />
                    <input type="password" placeholder="Password" name="password" />
                    <input type="password" placeholder="Confirm Password" name="comfirmPassword" />
                    <button disabled={isLoading}>{isLoading ? "Loading" : "Sign Up"}</button>
                </form>
            </div>
        </div>
    );
}