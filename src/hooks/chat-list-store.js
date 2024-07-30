import { create } from "zustand";
import { getDocDataById } from "../models/utils/firestore-method";

export const useChatListStore = create((set) => ({
    isLoading: false,
    conversations: null,
    lastMessages: null,
    fetchLastMessages: async (userId) => {
        try {
            const chatManagerData = await getDocDataById("chatManagers", userId);
            if (chatManagerData) {
                const conversationIds = Object.keys(chatManagerData.conversationStates);
                const conversationDatas = await Promise.all(conversationIds.map(async (conversationId) => {
                    const conversationData = await getDocDataById("conversations", conversationId);
                    if (conversationData) {
                        return {
                            id: conversationData.id,
                            participants: conversationData.participants,
                            lastMessage: conversationData.lastMessage,
                            conversationImg: conversationData.conversationImg
                        }
                    }
                    return null;
                }));

                const lastMessageDatas = await Promise.all(conversationDatas.map(async (conversationData) => {
                    if (conversationData.lastMessage) {
                        const lastMessageData = await getDocDataById("conversations/" + conversationData.id + "/messages", conversationData.lastMessage);
                        if (lastMessageData) {
                            return {
                                id: lastMessageData.id,
                                text: lastMessageData.text,
                                isSeen: lastMessageData.isSeen
                            }
                        }
                        return null;
                    }
                }));

                set({ conversations: conversationDatas, lastMessages: lastMessageDatas, isLoading: false });
            }
            else set({ conversations: null, lastMessages: null, isLoading: false });
        } catch (error) {
            console.log("Error fetching boxChats: ", error);
            set({ conversations: null, lastMessages: null, isLoading: false });
        }
    },
}));
