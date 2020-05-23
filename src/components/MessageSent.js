import React from "react";

function MessageSent(props) {
  return (
    <div className="text-right MessageSent">
      <div className="MessageBody">
        {props.message} 
      </div>
    </div>
  );
}

export default MessageSent;
