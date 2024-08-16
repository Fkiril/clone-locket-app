export default class Conversation {
    constructor(props) {
        this.id = props.id? props.id : "";
        this.participants = props.participants? props.participants : [];
        this.conversationImg = props.conversationImg? props.conversationImg : "";
        this.lastMessage = props.lastMessage? props.lastMessage : "";
    };

    toJSON() {
        return {
            id: this.id,
            participants: this.participants,
            conversationImg: this.conversationImg,
            lastMessage: this.lastMessage
        };
    }
}