import { createBatchedWrites, exitDoc, getDocDataById, getDocRef, writeIntoCol, writeIntoDoc } from "../models/utils/firestore-method";
import Message from "../models/entities/message";
import Conversation from "../models/entities/conversation";
import ChatManager from "../models/entities/chat-manager";

export default class ChatController {
    static async createChatManager(userId) {
        try {
            await writeIntoDoc("chatManagers", userId, false, new ChatManager({ userId: userId }).toJSON());
        } catch (error) {
            console.log("Error create chat manager: ", error);
            throw error;
        }
    }

    static async createConversation(participantIds) {
        try {
            const conversationId = await writeIntoCol("conversations", (
                new Conversation({
                    participants: participantIds
                })
            ).toJSON());

            const writes = [{
                work: "update",
                docRef: getDocRef("conversations", conversationId),
                field: "id",
                data: conversationId
            }];

            for (const participant of participantIds) {
                if (!(await exitDoc("chatManagers", participant))) {
                    writes.push({
                        work: "set",
                        docRef: getDocRef("chatManagers", participant),
                        data: new ChatManager({ userId: participant }).toJSON()
                    })
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
                    key: participantIds.find(p => p !== participant),
                    data: conversationId
                });
            };
            await createBatchedWrites(writes);

            return conversationId;
        } catch (error) {
            console.log("Error create conversation: ", error);
            throw error;
        }
    }

    static async getConversationIdWithFriend(userId, friendId) {
        try {
            const chatManagerData = await getDocDataById("chatManagers", userId);
            if (chatManagerData) {
                return chatManagerData.friendConversations[friendId];
            }

            return null;
        } catch (error) {
            console.log("Error get conversation id: ", error);
            throw error;
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
            throw error;
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
            throw error;
        }
    }

    static async sendMessage(conversationId, message) {
        try {
            const messageIns = new Message(message);

            const messageId = await writeIntoCol("conversations/"+conversationId+"/messages", {});

            const write = [{
                work: "set",
                docRef: getDocRef("conversations/"+conversationId+"/messages", messageId),
                data: messageIns.toJSON()
            },
            {
                work: "update",
                docRef: getDocRef("conversations/"+conversationId+"/messages", messageId),
                field: "id",
                data: messageId
            },
            {
                work: "update",
                docRef: getDocRef("conversations", conversationId),
                field: "lastMessage",
                data: messageId
            }];
            await createBatchedWrites(write);
        } catch (error) {
            console.log("Error send message: ", error);
            throw error;
        }
    }

    static async signalNewMessage(conversationId, senderId) {
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
                };
                await createBatchedWrites(writes);
            }
        } catch (error) {
            console.log("Error signal message: ", error);
            throw error;
        }
    }

    static async setIsSeenToMessages(userId, conversationId, messageIds) {
        try {
            if (!messageIds || messageIds.length === 0) return;

            const writes = messageIds.map((messageId) => {
                return {
                    work: "update",
                    docRef: getDocRef("conversations/"+conversationId+"/messages", messageId),
                    field: "isSeen",
                    data: true
                };
            });
            writes.push({
                work: "update-map",
                docRef: getDocRef("chatManagers", userId),
                field: "conversationStates",
                key: conversationId,
                data: 0
            })
            await createBatchedWrites(writes);
        } catch (error) {
            console.log("Error setIsSeenToMessages: ", error);
            throw error;
        }
    }

    static async getMessageById(conversationId, messageId) {
        try {
            return await getDocDataById("conversations/"+conversationId+"/messages", messageId);
        } catch (error) {
            console.log("Error getMessageById: ", error);
            throw error;
        }
    }
}