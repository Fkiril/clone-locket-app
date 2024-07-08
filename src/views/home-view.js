import React from "react";
import { Helmet } from "react-helmet";

export default function HomeView(props) {
    const {user_name} = props;

    return (
        <main>
            <Helmet>
                <title>Home</title>
            </Helmet>
            <h1>Welcome {user_name}</h1>
        </main>
    )
}