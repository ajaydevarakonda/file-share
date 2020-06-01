import React from "react";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import NavigationBar from "../NavigationBar/NavigationBar";
import MessageArea from "../MessageArea/MessageArea";
import Host from "../../lib/Host";
import Guest from "../../lib/Guest";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Container from "react-bootstrap/Container";
import SystemMessage from "../SystemMessage/SystemMessage";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.client = null;
    this.clientType = null;
    this.isDescriptionSet = false;

    this.state = {
      messages: [], // { type: "received|sent", message: "" }
      systemMessages: [], // { type: "system", message: "" }
      fileSendProgress: 0,
      fileReceiveProgress: 0,
    };

    this.handleMessageSumbit = this.handleMessageSumbit.bind(this);
    this.onFileSelected = this.onFileSelected.bind(this);
    this.initClientListeners = this.initClientListeners.bind(this);
  }

  async componentDidMount() {
    if (window.location.hash) {
      this.client = new Guest(window.location.hash.substring(1));
      this.clientType = "Guest";
    } else {
      this.client = new Host();
      this.clientType = "Host";
    }

    this.initClientListeners();
  }

  initClientListeners() {
    const self = this;

    this.client.onMessage = (msg) => {
      if (msg.type === "system") {
        return self.setState({
          systemMessages: self.state.systemMessages.concat(msg),
        });
      }

      return self.setState({
        messages: self.state.messages.concat(msg),
      });
    }

    this.client.onFileSendProgress = (progress) => {
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
    }

    this.client.onFileReceiveProgress = (progress) => {
      if (progress === 100) {
        // showing progress bar post 5 seconds is awkward.
        window.setTimeout(() => {
          return this.setState({
            fileReceiveProgress: 0,
          });
        }, 5000);
      }

      return self.setState({
        fileReceiveProgress: progress,
      });
    }

    this.client.onFile = (filename, filesize, persistentFile) => {
      const fileSizeInMb = (filesize / (1024 * 1024)).toFixed(2);
      const msg = { type: "system", message: `Received ${filename}(${fileSizeInMb} MB)` };

      return this.setState({
        systemMessages: this.state.systemMessages.concat(msg),
      });
    }
  }

  handleMessageSumbit(msg) {
    if (this.clientType === "Host" && !this.isDescriptionSet) {
      this.client.set_description(msg);
      this.isDescriptionSet = true;
    } else {
      this.client.sendMessage(msg);
    }
  }

  onFileSelected(e) {
    if (!e.target.files.length) {
      throw new Error("No file selected!");
    } else if (e.target.files[0].size === 0) {
      throw new Error("Emtpy file!");
    }

    this.client.sendFile(e.target.files[0]);
  }

  render() {
    return (
      <div className="App">
        <Container>
          <NavigationBar onFileSelected={this.onFileSelected} />
        </Container>

        <Container>
          <Row>
            <Col className="SystemMessageColumn" md={7}>
              <div className="SystemMessageArea">
                {this.state.systemMessages.map((msg, indx) => (
                  <SystemMessage key={indx} message={msg.message} />
                ))}
              </div>
            </Col>
            <Col className="MessageColumn" md={5}>
              <MessageArea
                messages={this.state.messages}
                fileSendProgress={this.state.fileSendProgress}
                fileReceiveProgress={this.state.fileReceiveProgress}
                onMessageSubmit={this.handleMessageSumbit}
              />
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default App;
