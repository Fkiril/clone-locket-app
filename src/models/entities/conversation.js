import React from "react";

export default class Conversation {
    constructor(props) {
        this.id = props.id? props.id : "";
        this.participants = props.participants? props.participants : [];
        this.conversationImg = props.conversationImg? props.conversationImg : "";
        this.pictures = props.pictures? props.pictures : [];
        this.attachments = props.attachments? props.attachments : [];
        this.lastMessage = props.lastMessage? props.lastMessage : "";
    };

    toJSON() {
        return {
            id: this.id,
            participants: this.participants,
            conversationImg: this.conversationImg,
            pictures: this.pictures,
            attachments: this.attachments,
            lastMessage: this.lastMessage
        };
    }
}