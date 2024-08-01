import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthenticationController from "../../controllers/authentication-controller";
import { useUserStore } from "../../hooks/user-store";
import "./authentication-view.css";
import { toast } from "react-toastify";
import { onAuthStateChanged } from "firebase/auth";

export default function AuthenticationView() {
    const navigate = useNavigate();

    const { currentUser } = useUserStore();

    const [isLoading, setIsLoading] = useState(false);
    const [showLogin, setShowLogin] = useState(true);
    // const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const unSubscribe = () => {
            // console.log("authentication-view.js: useEffect for currentUser: ", currentUser);
            if (currentUser) {
                // setIsChecking(false);
                navigate("/home");
            }
            else {
                setTimeout(() => {
                    // setIsChecking(false);
                    unSubscribe();
                }, 2000);
            }
        }

        return () => unSubscribe();
    }, [currentUser]);

    const handleLogIn = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData);

        await AuthenticationController.logIn(email, password).then(() => {
            toast.success("Login successfull!");
            setIsLoading(false);

            if (currentUser) navigate("/home");
        }).catch((error) => {
            toast.error("Invalid email or password. Please try again.");
            setIsLoading(false);
        });
    }

    const handleCreateAccount = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.target);
        const { userName, email, password, confirmPassword } = Object.fromEntries(formData);

        if (!userName || !email || !password || !confirmPassword) {
            toast.warning("All fields are required!");
            setIsLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.(com|edu\.vn)$/;
        if (emailRegex.test(email) === false) {
            toast.warning("Invalid email address!");
            setIsLoading(false);
            return;
        }
        
        if (password.length < 6) {
            toast.warning("Password must be at least 6 characters!");
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            toast.warning("Password does not match!");
            setIsLoading(false);
            return;
        }

        await AuthenticationController.createAccount(userName, email, password, confirmPassword).then(() => {
            toast.success("Create account successfull!");
            event.target.reset();
            setShowLogin(true);
        }).catch((error) => {
            toast.error("Failed to create account. Please try again.");
        });

        setIsLoading(false);
    }

    return (
        <div className="authentication min-h-screen flex items-center justify-center bg-gray-100">
        <div className="header-container text-center mb-8">
            <h1 className="app-title">Clone-locket</h1>
            <p className="app-subtitle">Clone-locket - Connect and share with your friends and family</p>
        </div>
        {/* {isChecking ? (
            <div className="checking">Checking...</div>
        ) : ( */}
        <div className="flex flex-col items-center">
            <div className="flex justify-center mb-5">
                <button
                    onClick={() => setShowLogin(true)}
                    className={`px-4 py-2 mx-2 ${showLogin ? "font-bold" : ""}`}
                >
                    Login
                </button>
                <button
                    onClick={() => setShowLogin(false)}
                    className={`px-4 py-2 mx-2 ${!showLogin ? "font-bold" : ""}`}
                >
                    Sign up
                </button>
            </div>

            {showLogin ? (
                <div className="w-80 mb-5">
                    
                    <form onSubmit={handleLogIn} className="flex flex-col">
                        <input type="text" placeholder="Email" name="email" required className="mb-3 p-2 border rounded"/>
                        <input type="password" placeholder="Password" name="password" required className="mb-3 p-2 border rounded"/>
                        <button disabled={isLoading} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700">
                            {isLoading ? "Loading" : "Login"}
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
                            {isLoading ? "Loading" : "Sign up"}
                        </button>
                    </form>
                </div>
            )}
        </div>
        {/* )} */}
        </div>
    );
}
