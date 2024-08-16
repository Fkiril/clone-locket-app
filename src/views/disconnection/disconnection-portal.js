import "./disconnection-portal.css";
import React from "react";
import { createPortal } from "react-dom";

export default function DisconnectionPortal() {
    return createPortal(
        <div className="disconnection-portal">
        <p className="disconnection-text">Your connection has been interrupted. Please check your connection!</p>
        <div className="disconnection-circle"></div>
      </div>,
      document.body
    );
};