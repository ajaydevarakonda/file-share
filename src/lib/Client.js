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

    // ---- text message ----
    this.onconnected_chat_channel = this.onconnected_chat_channel.bind(this);
    this.warn_if_chatchannel_not_inited = this.warn_if_chatchannel_not_inited.bind(
      this
    );
    this.on_message = this.on_message.bind(this);
    this.send_message = this.send_message.bind(this);
    this.send_system_message = this.send_system_message.bind(this);

    // ---- file ----
    this.onconnected_filesend_channel = this.onconnected_filesend_channel.bind(
      this
    );
    this.warn_if_filechannel_not_inited = this.warn_if_filechannel_not_inited.bind(
      this
    );
    this.on_file = this.on_file.bind(this);
    this._on_file = this._on_file.bind(this);
    this.send_file = this.send_file.bind(this);
    this.on_filesend_progress = this.on_filesend_progress.bind(this);
    this.on_filereceive_progress = this.on_filereceive_progress.bind(this);
    this.request_file_space = this.request_file_space.bind(this);
  }

  // ---- text message ----

  onconnected_chat_channel(event) {
    this.warn_if_chatchannel_not_inited();

    this.chat_channel.onmessage = (e) => {
      this.message_listeners.forEach((l) =>
        l({ type: "received", message: e.data })
      );
    };
  }

  warn_if_chatchannel_not_inited() {
    if (!this.chat_channel) {
      console.warn(
        "Client::onconnected_chat_channel() called without initializing this.chat_channel!"
      );
      return;
    }
  }

  /**
   * Add event listener for text message.
   *
   * @param {*} event_listener
   */
  on_message(event_listener) {
    this.message_listeners.push(event_listener);
  }

  /**
   * Send message to user on the other end.
   */
  send_message(msg) {
    this.chat_channel.send(msg);
    this.message_listeners.forEach((l) => l({ type: "sent", message: msg }));
  }

  /**
   * Send system message to all event listeners.
   *
   * @param {String} message
   */
  send_system_message(message) {
    this.message_listeners.forEach((listener) =>
      listener({ type: "system", message })
    );
  }

  // ---- file ----

  onconnected_filesend_channel(event) {
    this.warn_if_filechannel_not_inited();

    this.filesend_channel.onmessage = this._on_file;
  }

  warn_if_filechannel_not_inited() {
    if (!this.filesend_channel) {
      console.warn(
        "Client::onconnected_filesend_channel() called without initializing this.filesend_channel!"
      );
      return;
    }
  }

  /**
   * Private
   * This will be called when file send channel receives file data from the other user.
   * Not supposed to be used directly by the user, should be used as event listener on
   *
   *
   * @param {*} event
   */
  _on_file(event) {
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

  /**
   * Add event listener for new file.
   *
   * @param {Function} event_listener
   */
  on_file(event_listener) {
    this.file_listeners.push(event_listener);
  }

  /**
   * Called when a part of file is sent.
   *
   * @param {Function} event_listener
   */
  on_filesend_progress(event_listener) {
    this.filesend_progress_listeners.push(event_listener);
  }

  /**
   * Called when a part of file is received.
   *
   * @param {Function} event_listener
   */
  on_filereceive_progress(event_listener) {
    this.filereceive_progress_listeners.push(event_listener);
  }

  send_file(file) {
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

    /**
   * Filespace to store huge files.
   */
  async request_file_space(fileSpaceInMb=1) {
    return new Promise((resolve, reject) => {
      window.requestFileSystem =
        window.requestFileSystem || window.webkitRequestFileSystem;

      window.requestFileSystem(
        window.TEMPORARY,
        fileSpaceInMb * 1024 * 1024,
        resolve,
        reject
      );
    });
  }
}

export default Client;
