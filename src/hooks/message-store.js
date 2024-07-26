import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { fs_db } from "../models/services/firebase";

export const useMessageStore = create((set) => ({
    messages: [],
    isLoading: false,
    fetchMessages: async (boxChatId) => {
        try {
            if (!boxChatId) return set({ messages: [], isLoading: false });

            const boxChatRef = doc(fs_db, "boxChats", boxChatId);
            const boxChatSnap = await getDoc(boxChatRef);
            if (boxChatSnap.exists()) {
                const boxChatData = boxChatSnap.data();
                const msId = boxChatData.messages;
                
                const msData = await Promise.all(
                    msId.map(async (mId) => {
                        const mDocRef = doc(fs_db, "messages", mId);
                        const mDocSnap = await getDoc(mDocRef);
                        return mDocSnap.exists() ? mDocSnap.data() : null;
                    })
                );

                set({ messages: msData, isLoading: false });
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