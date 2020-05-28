class Client {
  constructor() {
    this.connection = new RTCPeerConnection({
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
    });

    this.chat_channel = null;
    this.filesend_channel = null;

    // ---- file send / received ----
    this.first_filechunk = true;
    this.receivebuffer = [];
    this.receivedsize = 0;
    this.filename_expected = "";
    this.filesize_expected = 0;

    // ---- external event listeners ----
    this.message_listeners = [];
    this.file_listeners = [];
    this.filesend_progress_listeners = [];
    this.filereceive_progress_listeners = [];

    this.onconnected_chat_channel = this.onconnected_chat_channel.bind(this);
    this.onconnected_filesend_channel = this.onconnected_filesend_channel.bind(
      this
    );

    this.sendMessage = this.sendMessage.bind(this);
    this.sendFile = this.sendFile.bind(this);
    this.addSystemMessageToMyQueue = this.addSystemMessageToMyQueue.bind(this);
  }

  onconnected_chat_channel(event) {
    if (!this.chat_channel) {
      console.warn(
        "Client::onconnected_chat_channel() called without initializing this.chat_channel!"
      );
      return;
    }

    this.chat_channel.onmessage = (e) => {
      this.message_listeners.forEach((l) =>
        l({ type: "received", message: e.data })
      );
    };
  }

  onconnected_filesend_channel(event) {
    if (!this.filesend_channel) {
      console.warn(
        "Client::onconnected_filesend_channel() called without initializing this.filesend_channel!"
      );
      return;
    }

    this.filesend_channel.onmessage = this.onFileSendChannelMessage;
  }

  set onMessage(event_listener) {
    this.message_listeners.push(event_listener);
  }

  set onFile(event_listener) {
    this.file_listeners.push(event_listener);
  }

  set onFileSendProgress(event_listener) {
    this.filesend_progress_listeners.push(event_listener);
  }

  set onFileReceiveProgress(event_listener) {
    this.filereceive_progress_listeners.push(event_listener);
  }

  /**
   * Send message to user on the other end.
   */
  sendMessage(msg) {
    this.chat_channel.send(msg);
    this.message_listeners.forEach((l) => l({ type: "sent", message: msg }));
  }

  /**
   * Adds system message to this users system message queue.
   *
   * @param {String} message
   */
  addSystemMessageToMyQueue(message) {
    this.message_listeners.forEach((listener) =>
      listener({ type: "system", message })
    );
  }

  /**
   * Private
   * This will be called when file send channel receives file data from the other user.
   * Not supposed to be used directly by the user, should be used as event listener on
   *
   *
   * @param {*} event
   */
  onFileSendChannelMessage(event) {
    // the first part of the message is the filename;;;filesizeInBytes;;;<file>
    if (this.first_filechunk) {
      [this.filename_expected, this.filesize_expected] = event.data.split(
        ";;;"
      );
      this.filesize_expected = parseInt(this.filesize_expected);

      this.first_filechunk = false;
      return;
    }

    this.receivebuffer.push(event.data);
    this.receivedsize += event.data.byteLength;

    this.filereceive_progress_listeners.forEach((l) =>
      l((this.receivedsize / this.filesize_expected) * 100)
    );

    if (this.receivedsize === this.filesize_expected) {
      this.file_listeners.forEach(l => l(this.filename_expected, this.filesize_expected, this.receivebuffer));

      this.receivebuffer = [];

      // for future files
      this.first_filechunk = true;
      this.receivedsize = 0;
      this.filename_expected = "";
      this.filesize_expected = 0;
    }
  }

  sendFile(file) {
    const { name: filename, size: filesize } = file;
    var file_reader = null;

    // first send filename and file size.
    this.filesend_channel.send(`${filename};;;${filesize};;;`);

    const chunkSize = 16384;
    file_reader = new FileReader();
    let offset = 0;

    file_reader.addEventListener("error", (error) =>
      console.error("Error reading file:", error)
    );

    file_reader.addEventListener("abort", (event) =>
      console.log("File reading aborted:", event)
    );

    file_reader.addEventListener("load", (e) => {
      this.filesend_channel.send(e.target.result);
      offset += e.target.result.byteLength;

      const progress = (offset / filesize) * 100;
      this.filesend_progress_listeners.forEach((l) => l(progress));

      if (offset < file.size) {
        readSlice(offset);
      } else {
        this.message_listeners.forEach((l) =>
          l({ type: "system", message: `Sent "${filename}".` })
        );
      }
    });

    const readSlice = (o) => {
      const slice = file.slice(offset, o + chunkSize);
      file_reader.readAsArrayBuffer(slice);
    };

    readSlice(0);
  }
}

export default Client;
