import React from "react";
import { Link } from "react-router-dom";
import "../styles/nav.css";

function Nav(props) {
  return (
    <nav className="nav">
      <Link className="nav__link" to="/authentication">
        {props.user ? "Account" : "Login"}
      </Link>{" "}
      |{" "}
      <Link className="nav__link" to="/">
        Home view
      </Link>{" "}
      |{" "}
      <Link className="nav__link" to="/chat">
        Chat room
      </Link>
    </nav>
  );
}

export default Nav;