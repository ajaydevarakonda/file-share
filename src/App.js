import React from "react";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import NavigationBar from "./components/NavigationBar";
import MessageArea from "./components/MessageArea";
import Host from "./lib/Host";
import Guest from "./lib/Guest";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.client = null;
    this.clientType = null;
    this.isDescriptionSet = false;

    this.state = {
      messages: [], // { type: "system|received|sent", message: "" }
      fileSendProgress: 0,
      fileReceiveProgress: 0,
    };

    this.handleMessageSumbit = this.handleMessageSumbit.bind(this);
    this.onFileSelected = this.onFileSelected.bind(this);
    this.initClientListeners = this.initClientListeners.bind(this);
    this.requestFileSpace = this.requestFileSpace.bind(this);
  }

  componentDidMount() {
    if (window.location.hash) {
      this.client = new Guest(window.location.hash.substring(1));
      this.clientType = "Guest";
    } else {
      this.client = new Host();
      this.clientType = "Host";
    }

    this.requestFileSpace();
    this.initClientListeners();
  }

  /**
   * Filespace to store huge files.
   */
  requestFileSpace() {
    const spaceInMb = (window.requestFileSystem =
      window.requestFileSystem || window.webkitRequestFileSystem);

    window.requestFileSystem(
      window.TEMPORARY,
      spaceInMb * 1024 * 1024 /*5MB*/,
      console.log,
      console.error
    );
  }

  initClientListeners() {
    const self = this;

    this.client.on_message((message) => {
      return self.setState({
        messages: self.state.messages.concat(message),
      });
    });

    this.client.on_filesend_progress((progress) => {
      if (progress === 100) {
        // showing progress bar post 5 seconds is awkward.
        window.setTimeout(() => {
          return this.setState({
            fileSendProgress: 0,
          });
        }, 5000);
      }

      return self.setState({
        fileSendProgress: progress,
      });
    });

    this.client.on_file((filename, filesize, fileByteArray) => {
      const received = new Blob(fileByteArray);

      const href = URL.createObjectURL(received);
      const filesizeMB = filesize / 1000;

      const msg = {
        type: "received",
        message: (
          <a href={href} download={filename}>
            {filename}({filesizeMB} MB)
          </a>
        ),
      };

      return this.setState({
        messages: this.state.messages.concat(msg),
      });
    });
  }

  handleMessageSumbit(msg) {
    if (this.clientType === "Host" && !this.isDescriptionSet) {
      this.client.set_description(msg);
      this.isDescriptionSet = true;
    } else {
      this.client.send_message(msg);
    }
  }

  onFileSelected(e) {
    if (!e.target.files.length) {
      throw new Error("No file selected!");
    } else if (e.target.files[0].size === 0) {
      throw new Error("Emtpy file!");
    }

    this.client.send_file(e.target.files[0]);
  }

  render() {
    return (
      <div className="App">
        <NavigationBar onFileSelected={this.onFileSelected} />
        <Row>
          <Col md={7}></Col>
          <Col md={5}>
            <MessageArea
              messages={this.state.messages}
              fileSendProgress={this.state.fileSendProgress}
              fileReceiveProgress={this.state.fileReceiveProgress}
              onMessageSubmit={this.handleMessageSumbit}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default App;
