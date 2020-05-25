import React from "react";
import ProgressBar from "react-bootstrap/ProgressBar";

import NavigationBar from "./components/NavigationBar";
import MessageInput from "./components/MessageInput";
import Host from "./lib/Host";
import Guest from "./lib/Guest";
import Message from "./components/Message";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.client = null;
    this.clientType = null;
    this.isDescriptionSet = false;

    this.state = {
      messages: [],
      fileSendProgress: 0,
    };

    this.handleMessageSumbit = this.handleMessageSumbit.bind(this);
    this.onFileSelected = this.onFileSelected.bind(this);
  }

  componentDidMount() {
    const self = this;

    if (window.location.hash) {
      this.client = new Guest(window.location.hash.substring(1));
      this.clientType = "Guest";
    } else {
      this.client = new Host();
      this.clientType = "Host";
    }

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
        <div className="MessageArea">
          <div className="container MessageBox">
            <br />
            {this.state.messages.map((msg, indx) => (
              <Message key={indx} type={msg.type} message={msg.message} />
            ))}
          </div>
          {this.state.fileSendProgress ? (
            <ProgressBar now={this.state.fileSendProgress} />
          ) : (
            ""
          )}
          <MessageInput onSubmit={this.handleMessageSumbit} />
        </div>
      </div>
    );
  }
}

export default App;
