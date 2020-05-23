import React from "react";

import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

function MessageInput() {
  return (
    <div className="MessageInput">
      <div className="container">
        <div className="row">
          <div className="col-md-11">
            <Form>
              <Form.Group controlId="formBasicMessage">
                <Form.Control type="text" placeholder="Message" />
              </Form.Group>
            </Form>
          </div>
          <div className="col-md-1">
            <Button variant="link" className="text-center">
              <FontAwesomeIcon icon={faPaperPlane} size="2x" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageInput;
