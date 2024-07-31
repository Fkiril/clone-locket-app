import { create } from "zustand";
import { getDocDataById, getDocsCol } from "../models/utils/firestore-method";
import { stringToDate } from "../models/utils/date-method";

export const useMessageStore = create((set, get) => ({
    messages: [],
    isLoading: false,
    fetchMessages: async (conversationId) => {
        try {
            if (!conversationId) return set({ messages: [], isLoading: false });

            const conversationData = await getDocDataById("conversations", conversationId);
            if (conversationData) {
                const querySnapshot = await getDocsCol("conversations/" + conversationId + "/messages");
                const mDatas = [];
                querySnapshot.docs.map((doc) => {
                    if (doc.exists()) {
                        if (get().messages && get().messages.find((m) => m?.id === doc.data().id)) {
                            return;
                        }
                        mDatas.push(doc.data());
                    }
                    return;
                });
                if (get().messages) {
                    mDatas.push(...get().messages);
                }
                mDatas.sort((a, b) => {
                    const aDate = stringToDate(a?.createdTime);
                    const bDate = stringToDate(b?.createdTime);
                    return aDate - bDate;
                })
                set({ messages: mDatas, isLoading: false });
            }
            else {
                set({ messages: [], isLoading: false });
            }
        } catch (error) {
            console.log("Error fetching messages: ", error);
            set({ messages: [], isLoading: false });
        }
    }
}))