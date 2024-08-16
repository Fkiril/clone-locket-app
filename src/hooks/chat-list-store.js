import { create } from "zustand";
import { getDocDataById } from "../models/utils/firestore-method";

export const useChatListStore = create((set, get) => ({
    isLoading: false,
    chatManager: null,
    conversations: null,
    lastMessages: null,
    fetchLastMessages: async (userId) => {
        try {
            console.log("fetchLastMessages: ", userId);
            if (!userId) {
                set({ isLoading: false, chatManager: null, conversations: null, lastMessages: null });
                return;
            }
            get().isLoading = true;

            const chatManagerData = await getDocDataById("chatManagers", userId);

            if (!chatManagerData || !chatManagerData.conversationStates || Object.keys(chatManagerData.conversationStates).length === 0) {
                get().isLoading = false;
                return;
            }
            
            const conversationIds = Object.keys(chatManagerData.conversationStates);
            const conversationDatas = await Promise.all(conversationIds.map(async (conversationId) => {
                const conversationData = await getDocDataById("conversations", conversationId);
                if (conversationData) {
                    return {
                        id: conversationData.id,
                        participants: conversationData.participants,
                        lastMessage: conversationData.lastMessage
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
        } catch (error) {
            console.log("Error fetching last messages: ", error);
            set({ chatManager: null, conversations: null, lastMessages: null, isLoading: false });
        }
    },
    fetchLastMessageOfConversation: async (userId, conversationId) => {
        try {
            console.log("fetchLastMessageOfConversation: ", userId, conversationId);
            if (!userId || !conversationId) return;
            get().isLoading = true;

            const chatManagerData = await getDocDataById("chatManagers", userId);

            if (!chatManagerData || !chatManagerData.conversationStates || Object.keys(chatManagerData.conversationStates).length === 0) {
                get().isLoading = false;
                return;
            }

            if (get().conversations.find((conversation) => conversation.id === conversationId)) {
                const oldLastMessageId = get().conversations.find((conversation) => conversation.id === conversationId)?.lastMessage;
                if (oldLastMessageId) {
                    get().lastMessages.splice(get().lastMessages.findIndex((lastMessage) => lastMessage.id === oldLastMessageId), 1);
                }
                get().conversations.splice(get().conversations.findIndex((conversation) => conversation.id === conversationId), 1);
            }

            const conversationData = await getDocDataById("conversations", conversationId);
            if (conversationData) {
                const lastMessageData = await getDocDataById("conversations/" + conversationId + "/messages", conversationData.lastMessage);
                if (lastMessageData) {
                    set({ chatManager: chatManagerData, conversations: [...get().conversations, {
                        id: conversationData.id,
                        participants: conversationData.participants,
                        lastMessage: lastMessageData.id
                    }], lastMessages: [...get().lastMessages, {
                        id: lastMessageData.id,
                        text: lastMessageData.text,
                        createdTime: lastMessageData.createdTime,
                        isSeen: lastMessageData.isSeen
                    }]})
                }
            }
        } catch (error) {
            console.log("Error fetching last message of conversation: ", error);
            return;
        }
    }
}));
