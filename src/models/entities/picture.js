import React from "react";

class Picture {
    constructor(id, uploadTime, url, canSee, scope) {
        this.id = id;
        this.uploadTime = uploadTime;
        this.url = url;
        this.canSee = canSee;
        this.scope = scope;
    };

    toJSON() {
        return {
            id: this.id,
            uploadTime: this.uploadTime.toDateString(),
            url: this.url,
            canSee: this.canSee,
            scope: this.scope
        };
    };
}