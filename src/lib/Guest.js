import React from "react";
import Client from "./Client";
import CopyableDescription from "../components/SystemMessage/CopyableDescription";

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
      this.addSystemMessageToMyQueue(
        "Connection status: " + this.connection.iceConnectionState
      );
    this.connection.onicegatheringstatechange = () => {
      if (this.connection.iceGatheringState !== "complete") {
        return;
      }

      const desc = JSON.stringify(this.connection.localDescription);
      this.addSystemMessageToMyQueue(
        <div>
          To make a connection, send the following string to the other person.
          <br />
          Just right click and copy
          <br />
          <CopyableDescription value={desc} />
        </div>
      );
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
