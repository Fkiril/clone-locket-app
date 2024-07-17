const ScopeEnum = {
    PUBLIC: "public",
    PRIVATE: "private",
    FRIENDS: "friends"
};

export default class Picture {
    constructor(id, ownerId, uploadTime, url, scope, text, willSee) {
        this.id = id;
        this.ownerId = ownerId;
        this.uploadTime = uploadTime;
        this.url = url;
        this.text = text;
        this.scope = scope;
        this.willSee = willSee;
    };

    toJSON() {
        return {
            id: this.id,
            ownerId: this.ownerId,
            uploadTime: this.uploadTime.toLocalString("vi-VN"),
            url: this.url,
            text: this.text,
            scope: this.scope,
            willSee: this.willSee.map(value => value)
        };
    };
}

export { ScopeEnum };