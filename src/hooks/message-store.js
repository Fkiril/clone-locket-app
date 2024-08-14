import { create } from "zustand";
import { getDocDataById } from "../models/utils/firestore-method";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { fs_db } from "../models/services/firebase";

export const useMessageStore = create((set, get) => ({
    messages: {},
    fetchedAll: false,
    isLoading: false,
    fetchMessages: async (conversationId) => {
        try {
            console.log("Fetching messages: ", conversationId);
            if (!conversationId || conversationId === "") {
                return;
            }

            const conversationData = await getDocDataById("conversations", conversationId);
            if (conversationData && conversationData.lastMessage) {
                const fetchLimit = (get().messages[conversationId] && get().messages[conversationId].length >= 15)? 3 : 15;
                const querySnapshot = await getDocs(
                    query(collection(fs_db, "conversations/" + conversationId + "/messages"),
                          orderBy("createdTime", "desc"),
                          limit(fetchLimit)));

                const mDatas = [];
                if (!querySnapshot.empty) {
                    querySnapshot.docs.forEach((doc) => {
                        if (doc.exists()) {
                            if (get().messages[conversationId] && get().messages[conversationId].find((m) => m?.id === doc.data().id)) {
                                return;
                            }
                            mDatas.push(doc.data());
                        }
                    });
    
                    mDatas.sort((a, b) => {
                        return a?.createdTime - b?.createdTime;
                    });
                    if (get().messages[conversationId] && get().messages[conversationId].length > 0) {
                        mDatas.push(...get().messages[conversationId]);
                    }
                    if (fetchLimit > querySnapshot.size) {
                        set({ messages: { ...get().messages, [conversationId]: mDatas }, fetchedAll: true, isLoading: false });
                    }
                    else set({ messages: { ...get().messages, [conversationId]: mDatas }, isLoading: false });
                }
                else set({ fetchedAll: true, isLoading: false });
            }

        } catch (error) {
            console.log("Error fetching messages: ", error);
            return;
        }
    },
    fetchAdditionalMessages: async (conversationId, lastestMessageCreatedTime) => {
        try {
            console.log("Fetching additional messages: ", conversationId, lastestMessageCreatedTime);

            if (!conversationId || conversationId === "" || !lastestMessageCreatedTime) {
                return;
            }

            const conversationData = await getDocDataById("conversations", conversationId);
            if (conversationData && conversationData.lastMessage) {
                const fetchLimit = 15;
                const querySnapshot = await getDocs(
                    query(collection(fs_db, "conversations/" + conversationId + "/messages"),
                        where("createdTime", "<", lastestMessageCreatedTime),
                        orderBy("createdTime", "desc"),
                        limit(fetchLimit)));

                const mDatas = [];
                if (!querySnapshot.empty) {
                    querySnapshot.docs.forEach((doc) => {
                        if (doc.exists()) {
                            mDatas.push(doc.data());
                        }
                    });
    
                    mDatas.sort((a, b) => {
                        return a?.createdTime - b?.createdTime;
                    });
                    if (get().messages[conversationId] && get().messages[conversationId].length > 0) {
                        mDatas.push(...get().messages[conversationId]);
                    }
                    else set({ messages: { ...get().messages, [conversationId]: mDatas }, fetchedAll: (querySnapshot.docs.length < fetchLimit), isLoading: false });
                }
                
                set({ fetchedAll: true, isLoading: false });
            }
        } catch (error) {
            console.log("Error fetching additional messages: ", error);
            return;
        }
    }
}));