import { createBatchedWrites, exitDoc, getDocDataById, getDocRef, writeIntoCol, writeIntoDoc } from "../models/utils/firestore-method";
import { toast } from "react-toastify";
import Message from "../models/entities/message";
import Conversation from "../models/entities/conversation";
import ChatManager from "../models/entities/chat-manager";

export default class ChatController {
    static async createChatManager(userId) {
        try {
            await writeIntoDoc("chatManagers", userId, false, new ChatManager({ userId: userId }).toJSON());
        } catch (error) {
            console.log("Error creating chat manager: ", error);
            throw error;
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

            for (const participant of participantIds) {
                if (!(await exitDoc("chatManagers", participant))) {
                    writes.push({
                        work: "set",
                        docRef: getDocRef("chatManagers", participant),
                        data: new ChatManager({ userId: participant }).toJSON()
                    });
                }

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
            }

            await createBatchedWrites(writes);
            toast.success("Created new conversation with participants: " + participantIds.join(", "));
            return conversationId;
        } catch (error) {
            console.log("Error creating conversation: ", error);
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
            console.log("Error getting conversation ID: ", error);
            return null;
        }
    }

    static async exitConversationWithFriend(userId, friendId) {
        try {
            const chatManagerData = await getDocDataById("chatManagers", userId);
            if (chatManagerData && chatManagerData.friendConversations[friendId]) {
                return true;
            }
            return false;
        } catch (error) {
            console.log("Error checking exit conversation: ", error);
            return false;
        }
    }

    static async getFriendIdByConversationId(userId, conversationId) {
        try {
            const chatManagerData = await getDocDataById("chatManagers", userId);
            if (chatManagerData) {
                return Object.keys(chatManagerData.friendConversations).find(key => chatManagerData.friendConversations[key] === conversationId);
            }
            return null;
        } catch (error) {
            console.log("Error getting friend ID: ", error);
            return null;
        }
    }

    static async sendMessage(conversationId, message) {
        try {
            const messageIns = new Message(message);
            const messageId = await writeIntoCol(`conversations/${conversationId}/messages`, {});

            const writes = [{
                work: "set",
                docRef: getDocRef(`conversations/${conversationId}/messages`, messageId),
                data: messageIns.toJSON()
            }, {
                work: "update",
                docRef: getDocRef(`conversations/${conversationId}/messages`, messageId),
                field: "id",
                data: messageId
            }, {
                work: "update",
                docRef: getDocRef("conversations", conversationId),
                field: "lastMessage",
                data: messageId
            }];

            await createBatchedWrites(writes);
        } catch (error) {
            console.log("Error sending message: ", error);
        }
    }

    static async signalMessage(conversationId, senderId) {
        try {
            const conversationData = await getDocDataById("conversations", conversationId);
            if (conversationData) {
                const writes = [];
                for (const participant of conversationData.participants) {
                    if (participant !== senderId) {
                        writes.push({
                            work: "update-map",
                            docRef: getDocRef("chatManagers", participant),
                            field: "conversationStates",
                            key: conversationId,
                            isIncrement: true,
                            data: 1
                        });
                    }
                }
                await createBatchedWrites(writes);
            }
        } catch (error) {
            console.log("Error signaling message: ", error);
        }
    }

    static async setIsSeenToMessages(userId, conversationId, messageIds) {
        try {
            if (!messageIds || messageIds.length === 0) return;

            const writes = messageIds.map((messageId) => ({

                work: "update",
                docRef: getDocRef(`conversations/${conversationId}/messages`, messageId),
                field: "isSeen",
                data: true
            }));

            writes.push({
                work: "update-map",
                docRef: getDocRef("chatManagers", userId),
                field: "conversationStates",
                key: conversationId,
                data: 0
            });

            await createBatchedWrites(writes);
        } catch (error) {
            console.log("Error setting messages as seen: ", error);
        }
    }

    static async getMessageById(conversationId, messageId) {
        try {
            return await getDocDataById(`conversations/${conversationId}/messages`, messageId);
        } catch (error) {
            console.log("Error getting message by ID: ", error);
        }
    }
}