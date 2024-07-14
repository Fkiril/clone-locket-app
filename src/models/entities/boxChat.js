import React from "react";

class BoxChat {
    constructor(id, messages) {
        this.id = id;
        this.messages = messages;
    };

    toJSON() {
        return {
            id: this.id,
            messages: this.messages.map(value => value.toJSON())
        };
    }
}