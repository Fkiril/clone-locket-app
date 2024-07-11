import React from "react";
import { auth } from "../../hooks/firebase";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import "./account.css";

function Account(props) {
    const { user, setView } = props;
    const logOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            toast.error("Something went wrong. Please try logging out again.");
            console.error(error);
        }
    };

    const setting = () => {
        
    }

    return (
        <>
            <div className="account-header">
                <h2>Account</h2>
                <button className="back-button" onClick={() => setView("home")} >
                    Back to home page
                </button>
            </div>

            <div>
                Hello {user.email}
            </div>

            <button className="logout-button" onClick={logOut}>
                Log Out
            </button>
        </>
    )
}

export default Account;