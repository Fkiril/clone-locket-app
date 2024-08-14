import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, fs_db } from "../models/services/firebase";
import { getDocRef } from "../models/utils/firestore-method";
import { collection, onSnapshot, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useUserStore } from "../hooks/user-store";
import { useChatListStore } from "../hooks/chat-list-store";
import { useInternetConnection } from "../hooks/internet-connection";
import { query } from "firebase/database";

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
                await Promise.all([
                    fetchUserInfo(auth?.currentUser?.uid),
                    fetchLastMessages(auth?.currentUser?.uid)
                ])
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
    }, [currentUser, auth?.currentUser, navigate]);

    useEffect(() => {
        if (auth?.currentUser?.uid && currentUser) {
            const unSubscribe = onSnapshot(
                getDocRef("users", auth?.currentUser?.uid),
                { includeMetadataChanges: false},
                async () => {
                    console.log("state-tracking.js: fetchUserInfo() for onSnapshot");
                    await fetchUserInfo(auth?.currentUser?.uid);
                }
            )
            
            return () => {
                unSubscribe();
            }
        }
    }, [onSnapshot])

    useEffect(() => {
        if (auth?.currentUser?.uid && currentUser) {
            const q = query(collection(fs_db, "conversations"), where("participants", "array-contains", auth?.currentUser?.uid));
            const unSubscribe = onSnapshot(
                q,
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
        <>
        </>
    )
}

export default StateTracking