import React from "react";
import { Helmet } from "react-helmet";
import Authentication from "../components/authentication";

function AuthenticationView(props) {
  return (
    <main>
      <Helmet>
        <title>Authentication</title>
      </Helmet>
      <Authentication {...props} />
    </main>
  );
}

export default AuthenticationView;