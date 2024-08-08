import { create } from "zustand";
import { getDocDataById } from "../models/utils/firestore-method";

export const useChatListStore = create((set) => ({
    isLoading: false,
    chatManager: null,
    conversations: null,
    lastMessages: null,
    fetchLastMessages: async (userId) => {
        try {
            console.log("fetchLastMessages: ", userId);
            if (!userId) set({ isLoading: false, chatManager: null, conversations: null, lastMessages: null });

            const chatManagerData = await getDocDataById("chatManagers", userId);
            if (chatManagerData && chatManagerData.conversationStates && Object.keys(chatManagerData.conversationStates).length > 0) {
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
                    if (conversationData && conversationData.lastMessage) {
                        const lastMessageData = await getDocDataById("conversations/" + conversationData.id + "/messages", conversationData.lastMessage);
                        if (lastMessageData) {
                            return {
                                id: lastMessageData.id,
                                text: lastMessageData.text,
                                createdTime: lastMessageData.createdTime,
                                isSeen: lastMessageData.isSeen
                            }
                        }
                    }
                }));

                set({ chatManager: chatManagerData, conversations: conversationDatas, lastMessages: lastMessageDatas, isLoading: false });
            }
            else set({ chatManager: null, conversations: null, lastMessages: null, isLoading: false });
        } catch (error) {
            console.log("Error fetching boxChats: ", error);
            set({ chatManager: null, conversations: null, lastMessages: null, isLoading: false });
        }
    },
}));
