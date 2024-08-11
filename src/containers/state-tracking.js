import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../models/services/firebase";
import { getDocRef } from "../models/utils/firestore-method";
import { onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useUserStore } from "../hooks/user-store";
import { useChatListStore } from "../hooks/chat-list-store";
import { useInternetConnection } from "../hooks/internet-connection";

const StateTracking = () => {
    const navigate = useNavigate();

    const { currentUser, fetchUserInfo } = useUserStore();
    const { fetchLastMessages } = useChatListStore();
    const { setConnectionState } = useInternetConnection();

    window.addEventListener("offline", () => {
        console.log("state-tracking.js: window.addEventListener('offline')");
        setConnectionState(false);
    })

    window.addEventListener("online", () => {
        console.log("state-tracking.js: window.addEventListener('online')");
        setConnectionState(true);
    })

    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, async () => {
            if (auth?.currentUser?.uid) {
                console.log("state-tracking.js: fetchUserInfo() for onAuthStateChanged");
                await fetchUserInfo(auth?.currentUser?.uid);
                await fetchLastMessages(auth?.currentUser?.uid);
            }
        });

        return () => {
            unSubscribe();
        }
    }, [onAuthStateChanged])

    useEffect(() => {
        if ((!(auth?.currentUser) || !currentUser)) {
            navigate("/");
            console.log("state-tracking.js: useEffect() for navigate to authentication page");
        }
    }, [currentUser, auth, auth?.currentUser])

    useEffect(() => {
        if (auth?.currentUser?.uid && currentUser) {
            const unSubscribe = onSnapshot(
                getDocRef("users", auth?.currentUser?.uid),
                { includeMetadataChanges: false },
                async () => {
                    console.log("state-tracking.js: fetchUserInfo() for onSnapshot");
                    await fetchUserInfo(auth?.currentUser?.uid);
            })
            
            return () => {
                unSubscribe();
            }
        }
    }, [onSnapshot])

    useEffect(() => {
        if (auth?.currentUser?.uid && currentUser) {
            const unSubscribe = onSnapshot(
                getDocRef("chatManagers", auth?.currentUser?.uid),
                { includeMetadataChanges: false },
                async () => {
                    console.log("state-tracking.js: fetchLastMessage() for onSnapshot");
                    await fetchLastMessages(auth?.currentUser?.uid);
                }
            );
            return () => {
                unSubscribe();
            };
        }
    }, [onSnapshot]);

    return (
        <div className="">
        </div>
    )
}

export default StateTracking