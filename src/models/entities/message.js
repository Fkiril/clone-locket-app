export default class Message {
    constructor(props) {
        this.id = props.id? props.id : "";
        this.senderId = props.senderId? props.senderId : "";
        this.createTime = props.createTime? props.createTime : "";
        this.text = props.text? props.text : "";
        this.attachment = props.attachment? props.attachment : "";
        this.isSeen = props.isSeen? props.isSeen : false;
    };

    toJSON() {
        return {
            id: this.id,
            senderId: this.senderId,
            createTime: this.createTime,
            text: this.text,
            attachment: this.attachment,
            isSeen: this.isSeen
        };
    }
}