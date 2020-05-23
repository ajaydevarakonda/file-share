import React from "react";

import NavigationBar from "./components/NavigationBar";
import MessageInput from "./components/MessageInput";
import Host from "./lib/Host";
import Guest from "./lib/Guest";

import MessageSent from "./components/MessageSent";
import MessageReceived from "./components/MessageReceived";
import SystemMessage from "./components/SystemMessage";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.client = window.location.hash
      ? new Guest(window.location.hash.substring(1))
      : new Host();

    this.messages = [];
  }

  render() {
    return (
      <div className="App">
        <NavigationBar />
        <div className="MessageArea">
          <div className="container MessageBox">
            <br />
            {/* {this.messages.map((message) => message)} */}

            <SystemMessage message="Thanks guys!" />
            <MessageSent message="Hey there" />
            <MessageReceived message="Hey!!!" />
            <MessageReceived message="Whazzup mate!!!" />
          </div>

          <MessageInput />
        </div>
      </div>
    );
  }
}

export default App;
