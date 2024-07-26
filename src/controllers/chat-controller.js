import { exitDoc, updateArrayField, writeCol, writeDoc } from "../models/utils/firestore-method";
import { toast } from "react-toastify";
import Message from "../models/entities/message";

export default class ChatController {
    static getBoxChatId(user1, user2) {
        return user1 > user2 ? user1 + user2 : user2 + user1;
    }

    static async exitBoxChat(boxChatId) {
        try {
            if (await exitDoc("boxChats", boxChatId)) {
                return true;
            }

            return false;
        } catch (error) {
            console.log("Error check exit box chat: ", error);
            return false;
        }
    }

    static async createBoxChat(boxChatId) {
        try {
            await writeDoc("boxChats", boxChatId, false, {
                id: boxChatId,
                messages: []
            });

            toast.success("New Box chat created");
        } catch (error) {
            toast.error("Failed to create new Box chat");
            console.log("Error creating new Box chat: ", error);
        }
    }

    static async sendMessage(boxChatId, message) {
        try {
            const new_message = new Message(
                "",
                message.senderId,
                (new Date()).toLocaleString("vi-VN").replace(/\//g, "-"),
                message.text,
                "",
                false
            );
            const messageId = await writeCol("messages", new_message.toJSON());

            await writeDoc("messages", messageId, true, {
                id: messageId
            });

            await updateArrayField("boxChats", boxChatId, "messages", true, messageId);
        } catch (error) {
            console.log("Error sending message: ", error);
        }
    }

    static async loadMessage() {}
}