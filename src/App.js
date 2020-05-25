import React from "react";

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
    };

    this.handleMessageSumbit = this.handleMessageSumbit.bind(this);
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
      self.setState({
        messages: self.state.messages.concat(message),
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

  render() {
    return (
      <div className="App">
        <NavigationBar />
        <div className="MessageArea">
          <div className="container MessageBox">
            <br />
            {this.state.messages.map((msg, indx) => (
              <Message key={indx} type={msg.type} message={msg.message} />
            ))}
          </div>
          <MessageInput onSubmit={this.handleMessageSumbit} />
        </div>
      </div>
    );
  }
}

export default App;
