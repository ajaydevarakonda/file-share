import { print } from "./utils";
import Client from "./Client";

class Guest extends Client {
  constructor(offer_string) {
    super();

    this.process_offer(offer_string);
    this.add_connection_eventhandlers();

    // ---- bindings ----
    this.process_offer = this.process_offer.bind(this);
    this.add_connection_eventhandlers = this.add_connection_eventhandlers.bind(
      this
    );
    this.ondatachannel = this.ondatachannel.bind(this);
  }

  async process_offer(offer_string) {
    const offer = JSON.parse(decodeURIComponent(offer_string));
    this.connection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await this.connection.createAnswer();
    this.connection.setLocalDescription(answer);
  }

  async add_connection_eventhandlers() {
    this.connection.oniceconnectionstatechange = () =>
      print("Connection status: " + this.connection.iceConnectionState);
    this.connection.onicegatheringstatechange = () => {
      if (this.connection.iceGatheringState !== "complete") return;
      print(
        "To make a connection, send the following string to the other person."
      );
      print("");
      print(JSON.stringify(this.connection.localDescription));
    };

    this.connection.ondatachannel = (e) => this.ondatachannel(e);
  }

  ondatachannel(event) {
    if (event.channel.label === "chat-channel") {
      this.chat_channel = event.channel;
      event.channel.onopen = this.onconnected_chat_channel;
    } else if (event.channel.label === "file-send-channel") {
      this.filesend_channel = event.channel;
      event.channel.onopen = this.onconnected_filesend_channel;
    }
  }

}

export default Guest;