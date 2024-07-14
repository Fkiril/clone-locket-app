import React from "react";
import { useUserStore } from "../../hooks/user-store";
import "./account.css";

export default function AccountView() {
    const { currentUser } = useUserStore();
    
    return (
        <div>Account</div>
    );
}