import { create } from "zustand";
import { getDocDataById, getDocsCol } from "../models/utils/firestore-method";
import { stringToDate } from "../models/utils/date-method";

export const useMessageStore = create((set, get) => ({
    messages: {},
    isLoading: false,
    fetchMessages: async (conversationId) => {
        try {
            console.log("Fetching messages: ", conversationId);
            if (!conversationId) return set({ messages: { ...get().messages, [conversationId]: [] }, isLoading: false });

            const conversationData = await getDocDataById("conversations", conversationId);
            if (conversationData) {
                const querySnapshot = await getDocsCol("conversations/" + conversationId + "/messages");
                const mDatas = [];
                querySnapshot.docs.forEach((doc) => {
                    if (doc.exists()) {
                        if (get().messages[conversationId] && get().messages[conversationId].find((m) => m?.id === doc.data().id)) {
                            return;
                        }
                        mDatas.push(doc.data());
                    }
                });
                if (get().messages[conversationId] && get().messages[conversationId].length > 0) {
                    mDatas.push(...get().messages[conversationId]);
                }
                mDatas.sort((a, b) => {
                    const aDate = stringToDate(a?.createdTime);
                    const bDate = stringToDate(b?.createdTime);
                    return aDate - bDate;
                });
                set({ messages: { ...get().messages, [conversationId]: mDatas }, isLoading: false });
            } else {
                set({ messages: { ...get().messages, [conversationId]: [] }, isLoading: false });
            }
        } catch (error) {
            console.log("Error fetching messages: ", error);
            set({ messages: { ...get().messages, [conversationId]: [] }, isLoading: false });
        }
    }
}));