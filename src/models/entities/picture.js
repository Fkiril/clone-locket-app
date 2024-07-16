const ScopeEnum = {
    PUBLIC: "public",
    PRIVATE: "private",
    FRIENDS: "friends"
};

export default class Picture {
    constructor(id, uploadTime, url, canSee, scope, text) {
        this.id = id;
        this.uploadTime = uploadTime;
        this.url = url;
        this.canSee = canSee;
        this.scope = scope;
        this.text = text;
    };

    toJSON() {
        return {
            id: this.id,
            uploadTime: this.uploadTime.toDateString(),
            url: this.url,
            canSee: this.canSee.map(value => value.toJSON()),
            scope: this.scope,
            text: this.text
        };
    };
}

export { ScopeEnum };