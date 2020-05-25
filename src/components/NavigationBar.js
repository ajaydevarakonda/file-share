import React from "react";

import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";

function NavigationBar(props) {
  const fileInput = React.createRef();

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="/">Fileshare</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Button variant="link" onClick={(e) => {
            e.preventDefault();
            fileInput.current.click();
          }}>
            <FontAwesomeIcon icon={faPaperclip} size="2x" />
          </Button>
        </Nav>
      </Navbar.Collapse>

      <input
        id="fileInput"
        type="file"
        style={{ display: "none" }}
        ref={fileInput}
        onChange={props.onFileSelected}
      />
    </Navbar>
  );
}

export default NavigationBar;
