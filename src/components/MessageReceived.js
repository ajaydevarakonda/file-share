import React from "react";

function MessageReceived(props) {
  return (
    <div className="text-left MessageReceived">
      <div className="MessageBody">
        {props.message}
      </div>
    </div>
  );
}

export default MessageReceived;
