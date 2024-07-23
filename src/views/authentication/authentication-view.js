import "./authentication-view.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthenticationController from "../../controllers/authentication-controller";
import { useUserStore } from "../../hooks/user-store";
import TextField from '@mui/material/TextField';
import MetaData from '../Layouts/MetaData';
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
          const [email, setEmail] = useState("");
          const [password, setPassword] = useState("");
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
        <div className="authentication">
            <div className="item">
                <h2>Welcome to Locket</h2>
                <form onSubmit={_logIn}>
                      <div className="flex flex-col w-full gap-4">

                                    <TextField
                                        fullWidth
                                        id="email"
                                        label="Email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <TextField
                                        fullWidth
                                        id="password"
                                        label="Password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                        

                                </div>
                </form>
            </div>
            <Link to="/register" className="font-medium text-sm text-primary-blue">New to Locket? Create an account</Link>
            
    );
}
