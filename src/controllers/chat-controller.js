import { createBatchedWrites, exitDoc, getDocDataById, getDocRef, updateArrayField, writeCol, writeDoc, writeIntoCol, writeIntoDoc } from "../models/utils/firestore-method";
import { toast } from "react-toastify";
import Message from "../models/entities/message";
import Conversation from "../models/entities/conversation";
import ChatManager from "../models/entities/chat-manager";

export default class ChatController {
    static async createChatManager(userId) {
        try {
            await writeIntoDoc("chatManagers", userId, false, new ChatManager({ userId: userId }).toJSON());
            toast.success("Created chat manager");
        } catch (error) {
            toast.error("Failed to create chat manager. Please try again");

            console.log("Error create chat manager: ", error);
        }
    }

    static async createConversation(participantIds) {
        try {
            const conversationId = await writeIntoCol("conversations", {});

            const writes = [{
                work: "set",
                docRef: getDocRef("conversations", conversationId),
                data: new Conversation({
                    id: conversationId,
                    participants: participantIds
                }).toJSON()
            }];

            participantIds.forEach((participant) => {
                writes.push({
                    work: "update-map",
                    docRef: getDocRef("chatManagers", participant),
                    field: "conversationStates",
                    key: conversationId,
                    data: 0
                });

                writes.push({
                    work: "update-map",
                    docRef: getDocRef("chatManagers", participant),
                    field: "friendConversations",
                    key: participantIds.filter(p => p !== participant),
                    data: conversationId
                });
            });

            await createBatchedWrites(writes);
            toast.success("Created new conversation of: ", participantIds);
            return conversationId;
        } catch (error) {
            console.log("Error create conversation: ", error);

            return null;
        }
    }

    static async getConversationIdWithFriend(userId, friendId) {
        try {
            const chatManagerData = await getDocDataById("chatManagers", userId);
            if (chatManagerData) {
                return chatManagerData.friendConversations[friendId];
            }
        } catch (error) {
            console.log("Error get conversation id: ", error);

            return null;
        }
    }

    static async exitConversationWithFriend(userId, friendId) {
        try {
            const chatManagerData = await getDocDataById("chatManagers", userId);
            if (chatManagerData) {
                if (chatManagerData.friendConversations[friendId]) {
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.log("Error check exit conversation: ", error);
            return false;
        }
    }

    static async getFriendIdByConversationId(userId, conversationId) {
        try {
            const chatManagerData = await getDocDataById("chatManagers", userId);
            if (chatManagerData) {
                const result = Object.keys(chatManagerData.friendConversations).find(key => chatManagerData.friendConversations[key] === conversationId);
                return result;
            }
            return null;
        } catch (error) {
            console.log("Error get friend id: ", error);

            return null;
        }
    }

    static async sendMessage(conversationId, message) {
        try {
            const messageData = new Message(message);

            const messageId = await writeIntoCol("conversations/"+conversationId+"/messages", {});

            const write = [{
                work: "set",
                docRef: getDocRef("conversations/"+conversationId+"/messages", messageId),
                data: messageData.toJSON()
            },
            {
                work: "update",
                docRef: getDocRef("conversations", conversationId),
                data: {
                    lastMessage: messageData
                }
            }];
            await createBatchedWrites(write);
        } catch (error) {
            console.log("Error send message: ", error);
        }
    }

    static async signalMessage(conversationId) {
        try {
            const conversationData = await getDocDataById("conversations", conversationId);
            if (conversationData) {
                const writes = conversationData.participants.forEach((participant) => {
                    return {
                        work: "update-map",
                        docRef: getDocRef("chatManagers", participant),
                        field: "conversationStates",
                        key: conversationId,
                        isIncrement: true,
                        data: 1
                    };
                });
                await createBatchedWrites(writes);
            }
        } catch (error) {
            console.log("Error signal message: ", error);
        }
    }

    static async setIsSeenToMessages(conversationId, messageIds) {
        try {
            const writes = messageIds.map((messageId) => {
                return {
                    work: "update",
                    docRef: getDocRef("conversations/"+conversationId+"/messages", messageId),
                    data: {
                        isSeen: true
                    }
                };
            });
            await createBatchedWrites(writes);
        } catch (error) {
            console.log("Error setIsSeenToMessages: ", error);
        }
    }

    static async getMessageById(conversationId, messageId) {
        try {
            return await getDocDataById("conversations/"+conversationId+"/messages", messageId);
        } catch (error) {
            console.log("Error getMessageById: ", error);
        }
    }
}