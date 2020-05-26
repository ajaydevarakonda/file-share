import React from "react";
import PropTypes from "prop-types";
import ProgressBar from "react-bootstrap/ProgressBar";
import Container from "react-bootstrap/Container";

import MessageInput from "./MessageInput";
import Message from "./Message";

function MessageArea(props) {
  return (
    <div className="MessageArea">
      <div className="container MessageBox">
        <br />
        {props.messages.map((msg, indx) => (
          <Message key={indx} type={msg.type} message={msg.message} />
        ))}
      </div>

      {props.fileSendProgress ? (
        <ProgressBar now={props.fileSendProgress} />
      ) : (
        ""
      )}

      {props.fileReceiveProgress ? (
        <ProgressBar variant="warning" now={props.fileReceiveProgress} />
      ) : (
        ""
      )}

      <MessageInput onSubmit={props.onMessageSubmit} />
    </div>
  );
}

MessageArea.propTypes = {
  messages: PropTypes.array.isRequired,
  fileSendProgress: PropTypes.number.isRequired,
  fileReceiveProgress: PropTypes.number.isRequired,
  onMessageSubmit: PropTypes.func.isRequired,
};

export default MessageArea;
