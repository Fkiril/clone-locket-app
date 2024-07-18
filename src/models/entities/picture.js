const ScopeEnum = {
    PUBLIC: "public",
    PRIVATE: "private",
    SPECIFY: "specify"
};

export default class Picture {
    constructor(id, ownerId, uploadTime, url, scope, text, canSee) {
        this.id = id;
        this.ownerId = ownerId;
        this.uploadTime = uploadTime;
        this.url = url;
        this.text = text;
        this.scope = scope;
        this.canSee = canSee;
    };

    toJSON() {
        return {
            id: this.id,
            ownerId: this.ownerId,
            uploadTime: this.uploadTime,
            url: this.url,
            text: this.text,
            scope: this.scope,
            canSee: this.canSee.map(value => value)
        };
    };
}

export { ScopeEnum };