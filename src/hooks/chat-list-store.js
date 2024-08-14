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
            if (!userId) return;

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
            else return;
        } catch (error) {
            console.log("Error fetching boxChats: ", error);
            set({ chatManager: null, conversations: null, lastMessages: null, isLoading: false });
        }
    },
}));
