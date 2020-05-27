import React from "react";
import PropTypes from "prop-types";
import ProgressBar from "react-bootstrap/ProgressBar";

import MessageInput from "./MessageInput";
import Message from "./Message";

import "./MessageArea.css";

class MessageArea extends React.Component {
  constructor(props) {
    super(props);

    this.boxRef = React.createRef();
  }

  componentDidUpdate() {
    this.boxRef.current.scrollTop = this.boxRef.current.scrollHeight;
  }

  render() {
    return (
      <div className="MessageArea">
        <div className="MessageBox" ref={this.boxRef}>
          <br />
          {this.props.messages.map((msg, indx) => (
            <Message key={indx} type={msg.type} message={msg.message} />
          ))}
        </div>

        {this.props.fileSendProgress ? (
          <ProgressBar now={this.props.fileSendProgress} />
        ) : (
          ""
        )}

        {this.props.fileReceiveProgress ? (
          <ProgressBar variant="warning" now={this.props.fileReceiveProgress} />
        ) : (
          ""
        )}

        <MessageInput onSubmit={this.props.onMessageSubmit} />
      </div>
    );
  }
}

MessageArea.propTypes = {
  messages: PropTypes.array.isRequired,
  fileSendProgress: PropTypes.number.isRequired,
  fileReceiveProgress: PropTypes.number.isRequired,
  onMessageSubmit: PropTypes.func.isRequired,
};

export default MessageArea;
