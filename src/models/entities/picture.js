const ScopeEnum = {
    PUBLIC: "public",
    PRIVATE: "private",
    SPECIFY: "specify"
};

const EmojiEnum = {
    LIKE: "👍",
    HEART: "❤️",
    WOW: "😮",
    SAD: "😢",
    ANGRY: "😡"
};

export default class Picture {
    constructor(props) {
        this.id = props.id? props.id : "";
        this.ownerId = props.ownerId? props.ownerId : "";
        this.uploadTime = props.uploadTime? props.uploadTime : "";
        this.url = props.url? props.url : "";
        this.text = props.text? props.text : "";
        this.scope = props.scope? props.scope : "";
        this.canSee = props.canSee? props.canSee : [];
        this.reactions = props.reactions? props.reactions : [];
    };

    toJSON() {
        return {
            id: this.id,
            ownerId: this.ownerId,
            uploadTime: this.uploadTime,
            url: this.url,
            text: this.text,
            scope: this.scope,
            canSee: this.canSee.map(value => value),
            reactions: this.reactions.map(reaction => {
                return {
                    senderId: reaction.senderId,
                    emoji: reaction.emoji
                }
            })
        };
    };
}

export { ScopeEnum, EmojiEnum };