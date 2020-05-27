import React from "react";
import "./SystemMessage.css";

/**
 *
 * @param {*} props.type    system, sent or received.
 * @param {*} props.message any message to write to chatbox.
 */
function SystemMessage(props) {
  return (
    <div className="SystemMessage">
      <div className="SystemMessageBody">{props.message}</div>
    </div>
  );
}

export default SystemMessage;
