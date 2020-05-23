import { print } from "./utils";
import Client from "./Client";

class Host extends Client{
  constructor() {
    super();

    print("Initializing...");

    this.init_channels();
    this.add_connection_eventhandlers();
    this.add_setdescription_eventhandler();

    // ---- bindings ----
    this.init_channels = this.init_channels.bind(this);
    this.add_connection_eventhandlers = this.add_connection_eventhandlers.bind(this);
    this.add_setdescription_eventhandler = this.add_setdescription_eventhandler.bind(this);
  }

  init_channels() {
    // chat channel
    this.chat_channel = this.connection.createDataChannel("chat-channel");
    this.chat_channel.onopen = (event) => this.onconnected_chat_channel();

    // file send channel
    this.filesend_channel = this.connection.createDataChannel("file-send-channel");
    this.filesend_channel.binaryType = "arraybuffer";
    this.filesend_channel.onopen = (event) =>
        this.onconnected_filesend_channel(this.filesend_channel);
  }

  async add_connection_eventhandlers() {
    this.connection.setLocalDescription(await this.connection.createOffer());
    this.connection.oniceconnectionstatechange = () =>
      print("Connection status: " + this.connection.iceConnectionState);
    this.connection.onicegatheringstatechange = () => {
      if (this.connection.iceGatheringState !== "complete") return;
      print("To make a connection:");
      print("1. Send the following URL to the other person.");
      print("2. Type the result in the bottom text field.");
      print("");
      print(
        window.location.href +
          "#" +
          encodeURIComponent(JSON.stringify(this.connection.localDescription))
      );
    };    
  }

  add_setdescription_eventhandler() {
    // const input = document.getElementById("input");
    // input.onkeypress = (event) => {
    //   if (event.key !== "Enter") return;
    //   this.connection.setRemoteDescription(JSON.parse(input.value));
    //   input.value = "";
    //   input.onkeypress = undefined;
    // };
  }
}

export default Host;