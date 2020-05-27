import React from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

class MessageInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: "",
    }

    this.onMessageSend = this.onMessageSend.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.inputRef = React.createRef();
  }

  onMessageSend(e) {
    e.preventDefault();
    this.props.onSubmit(this.state.message);
    return this.setState({
      message: "",
    })
  }

  handleMessageChange(e) {
    return this.setState({
      message: this.inputRef.current.value
    });
  }

  render() {
    return (
      <div className="MessageInput">
        <div className="container">
          <div className="row">
            <div className="col-md-11">
              <Form onSubmit={this.onMessageSend} autoComplete="off">
                <Form.Group controlId="formBasicMessage">
                  <Form.Control
                    type="text"
                    placeholder="Message"
                    value={this.state.message}
                    onChange={this.handleMessageChange}
                    ref={this.inputRef}
                  />
                </Form.Group>
              </Form>
            </div>
            <div className="col-md-1">
              <Button
                variant="link"
                className="text-center"
                onClick={this.onMessageSend}
              >
                <FontAwesomeIcon icon={faPaperPlane} size="2x" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MessageInput;
