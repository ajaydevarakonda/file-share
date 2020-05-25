import { print } from "./utils";
import Client from "./Client";
import React from "react";

import CopyableDescription from "../components/CopyableDescription";

class Host extends Client {
  constructor() {
    super();

    print("Initializing...");

    this.init_channels();
    this.add_connection_eventhandlers();

    // ---- bindings ----
    this.init_channels = this.init_channels.bind(this);
    this.add_connection_eventhandlers = this.add_connection_eventhandlers.bind(
      this
    );
    this.set_description = this.set_description.bind(this);
  }

  init_channels() {
    // chat channel
    this.chat_channel = this.connection.createDataChannel("chat-channel");
    this.chat_channel.onopen = (event) => this.onconnected_chat_channel();

    // file send channel
    this.filesend_channel = this.connection.createDataChannel(
      "file-send-channel"
    );
    this.filesend_channel.binaryType = "arraybuffer";
    this.filesend_channel.onopen = (event) =>
      this.onconnected_filesend_channel(this.filesend_channel);
  }

  async add_connection_eventhandlers() {
    this.connection.setLocalDescription(await this.connection.createOffer());
    this.connection.oniceconnectionstatechange = () =>
      this.send_system_message(
        "Connection status: " + this.connection.iceConnectionState
      );
    this.connection.onicegatheringstatechange = () => {
      if (this.connection.iceGatheringState !== "complete") {
        return;
      }

      const shareLink =
        window.location.href +
        "#" +
        encodeURIComponent(JSON.stringify(this.connection.localDescription));

      const systemMessage = (
        <p>
          To make a connection:
          <br />
          1. Send the following URL to the other person and 2. Type the result
          in the bottom text field.
          <br />
          <br />
          <CopyableDescription value={shareLink} />
        </p>
      );

      this.send_system_message(systemMessage);
    };
  }

  set_description(desc) {
    this.connection.setRemoteDescription(JSON.parse(desc));
  }
}

export default Host;
