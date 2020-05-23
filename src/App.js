import React from "react";

import NavigationBar from "./components/NavigationBar";
import MessageArea from "./components/MessageArea";
import Host from "./lib/Host";
import Guest from "./lib/Guest";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.client = window.location.hash
      ? new Guest(window.location.hash.substring(1))
      : new Host();
  }

  render() {
    return (
      <div className="App">
        <NavigationBar />
        <MessageArea />
      </div>
    );
  }
}

export default App;
