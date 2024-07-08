import React from "react";
import { Helmet } from "react-helmet";
import Chat from "../components/chat";
import { Navigate } from "react-router-dom";

function ChatView(props) {

    const {user} = props;

    if (!(user !== null)) {
        return <Navigate to="/authentication" />;
    }

    return (
        <main>
            <Helmet>
                <title>Chat</title>
            </Helmet>
            <Chat {...props} />
        </main>
    );
}

export default ChatView;