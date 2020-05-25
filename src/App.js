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

    this.state = {
      messages: [],
      client: null,
      isDescriptionSet: false,
    };

    this.handleMessageSumbit = this.handleMessageSumbit.bind(this);
  }

  componentDidMount() {
    const self = this;

    this.client = window.location.hash
      ? new Guest(window.location.hash.substring(1))
      : new Host();

    this.client.on_message((message) => {
      self.setState({
        messages: self.state.messages.concat(message),
      });
    });
  }

  handleMessageSumbit(msg) {
    if (this.state.isDescriptionSet) {
      // send it to the other user.
    } else {
      this.client.set_description(msg);
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
          <MessageInput onSubmit={this.handleMessageSumbit}/>
        </div>
      </div>
    );
  }
}

export default App;
