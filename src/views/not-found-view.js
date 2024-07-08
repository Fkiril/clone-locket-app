import React from "react";
import { Helmet } from "react-helmet";

function NotFoundView() {
  return (
    <main>
      <Helmet>
        <title>Not Found!</title>
      </Helmet>
      <p>No such view exists!</p>
    </main>
  );
}

export default NotFoundView;