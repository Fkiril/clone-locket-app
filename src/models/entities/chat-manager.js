export default class ChatManager {
    constructor(props) {
        this.userId = props.userId? props.userId : "";
        this.conversationStates = props.conversationStates? props.conversationStates : null;
        this.friendConversations = props.friendConversations? props.friendConversations : null;
    }

    toJSON() {
        return {
            userId: this.userId,
            conversationStates: this.conversationStates,
            friendConversations: this.friendConversations
        }
    }
}