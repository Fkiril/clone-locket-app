import React from "react";

class textbfMessage {
    constructor(id, senderId, createTime, text, attachment, isSeen) {
        this.id = id;
        this.senderId = senderId;
        this.createTime = createTime;
        this.text = text;
        this.attachment = attachment;
        this.isSeen = isSeen;
    };

    toJSON() {
        return {
            id: this.id,
            senderId: this.senderId,
            createTime: this.createTime.toDateString(),
            text: this.text,
            attachment: this.attachment,
            isSeen: this.isSeen
        };
    }
}