import React from "react";

/**
 *
 * @param {*} props.type    system, sent or received.
 * @param {*} props.message any message to write to chatbox.
 */
function Message(props) {
  if (props.type === "system") {
    return <div className="SystemMessage">{props.message}</div>;
  }

  return (
    <div
      className={
        props.type === "sent"
          ? "text-right MessageSent"
          : "text-left MessageReceived"
      }
    >
      <div className="MessageBody">{props.message}</div>
    </div>
  );
}

export default Message;
