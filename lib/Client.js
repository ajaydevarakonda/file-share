class Client {
  constructor() {
    this.connection = new RTCPeerConnection({
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
    });

    this.chat_channel = null;
    this.filesend_channel = null;
    this.first_filechunk = true;

    this.receivebuffer = [];
    this.receivedsize = 0;
    this.filename_expected = "";
    this.filesize_expected = 0;

    // ---- bindings ----
    this.onrecievefile = this.onrecievefile.bind(this);
    this.sendfile = this.sendfile.bind(this);

    this.onconnected_chat_channel = this.onconnected_chat_channel.bind(this);
    this.onconnected_filesend_channel = this.onconnected_filesend_channel.bind(
      this
    );
  }

  onconnected_chat_channel(event) {
    if (!this.chat_channel) {
      console.warn(
        "Client::onconnected_chat_channel() called without initializing this.chat_channel!"
      );
      return;
    }

    this.chat_channel.onmessage = (event) => print("Received : " + event.data);
    const input = document.getElementById("input");
    input.onkeypress = (event) => {
      if (event.key !== "Enter") return;
      this.chat_channel.send(input.value);
      print("Sent: " + input.value);
      input.value = "";
    };
  }

  onconnected_filesend_channel(event) {
    if (!this.filesend_channel) {
      console.warn(
        "Client::onconnected_filesend_channel() called without initializing this.filesend_channel!"
      );
      return;
    }

    this.filesend_channel.onmessage = this.onrecievefile;

    const input = document.getElementById("fileInput");
    input.onchange = this.sendfile;
  }

  onrecievefile(event) {
    console.log(`Received Message ${event.data.byteLength}`);

    // the first part of the message is the filename;;;filesizeInBytes;;;<file>
    if (this.first_filechunk) {
      [this.filename_expected, this.filesize_expected] = event.data.split(";;;");
      this.filesize_expected = parseInt(this.filesize_expected);

      this.first_filechunk = false;
      return;
    }

    this.receivebuffer.push(event.data);
    this.receivedsize += event.data.byteLength;

    console.log(
      `expected: ${this.receivedsize}, recieved: ${this.filesize_expected}`
    );

    if (this.receivedsize === this.filesize_expected) {
      const received = new Blob(this.receivebuffer);
      this.receivebuffer = [];

      const downloadAnchor = document.getElementById("download-anchor");
      downloadAnchor.href = URL.createObjectURL(received);
      downloadAnchor.download = this.filename_expected;
      downloadAnchor.textContent = `Click to download '${this.filename_expected}' (${this.filesize_expected} bytes)`;
      downloadAnchor.style.display = "block";

      $("#fileDownloadModal").modal("show");

      // for future files
      this.first_filechunk = true;
      this.receivedsize = 0;
      this.filename_expected = "";
      this.filesize_expected = 0;
    }
  }

  /**
   * Static
   */
  getfile(e) {
    const { files } = e.target;

    if (!files.length) {
      throw new Error("No file selected!");
    }

    const [file] = files;

    if (file.size === 0) {
      throw new Error("Emtpy file!");
    }

    return file;
  }

  sendfile(e) {
    const self = this;
    const file = this.getfile(e);

    const { name: filename, size: filesize } = file;
    var file_reader = null;

    const send_progress = document.getElementById("send-progress");

    $("#myModal").modal("show");
    document.getElementById("myFilename").textContent = filename;
    document.getElementById("send-btn").addEventListener(
      "click",
      function () {
        // first send filename and file size.
        self.filesend_channel.send(`${filename};;;${filesize};;;`);

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
          console.log("FileRead.onload ", e);
          self.filesend_channel.send(e.target.result);
          offset += e.target.result.byteLength;
          send_progress.style.width = (offset / filesize) * 100;
          console.log(send_progress.style.width)

          if (offset < file.size) {
            readSlice(offset);
          } else {
            // ---- file sent ----
            document.getElementById("sending-file").style.display = "none";
            document.getElementById("sent-file").style.display = "block";
          }
        });

        const readSlice = (o) => {
          console.log("readSlice ", o);
          const slice = file.slice(offset, o + chunkSize);
          file_reader.readAsArrayBuffer(slice);
        };
        readSlice(0);
      },
      {
        once: true,
      }
    );
  }
}
