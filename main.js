// globals
var fileSendChannel;
var chatChannel;

var receiveBuffer = [];
var recievingNewFile = true;
var receivedSize = 0;
var fileName_recieved = '';
var fileSize_recieved = 0;

const downloadAnchor = document.getElementById("download-anchor");




async function runHost(connection) {
  print("Initializing...");

  // ---- chat channel ----
  chatChannel = connection.createDataChannel("chat-channel");
  chatChannel.onopen = (event) =>
    onConnectionEstablished_chatChannel(chatChannel);

  // ---- file send channel ----
  fileSendChannel = connection.createDataChannel("file-send-channel");
  fileSendChannel.binaryType = "arraybuffer";
  fileSendChannel.onopen = (event) =>
    onConnectionEstablished_fileSendChannel(fileSendChannel);

  connection.setLocalDescription(await connection.createOffer());
  connection.oniceconnectionstatechange = () =>
    print("Connection status: " + connection.iceConnectionState);
  connection.onicegatheringstatechange = () => {
    if (connection.iceGatheringState !== "complete") return;
    print("To make a connection:");
    print("1. Send the following URL to the other person.");
    print("2. Type the result in the bottom text field.");
    print("");
    print(
      window.location.href +
        "#" +
        encodeURIComponent(JSON.stringify(connection.localDescription))
    );
  };

  const input = document.getElementById("input");
  input.onkeypress = (event) => {
    if (event.key !== "Enter") return;
    connection.setRemoteDescription(JSON.parse(input.value));
    input.value = "";
    input.onkeypress = undefined;
  };
}

async function runGuest(connection, offerString) {
  const offer = JSON.parse(decodeURIComponent(offerString));
  connection.setRemoteDescription(new RTCSessionDescription(offer));
  connection.setLocalDescription(await connection.createAnswer());
  connection.oniceconnectionstatechange = () =>
    print("Connection status: " + connection.iceConnectionState);
  connection.onicegatheringstatechange = () => {
    if (connection.iceGatheringState !== "complete") return;
    print(
      "To make a connection, send the following string to the other person."
    );
    print("");
    print(JSON.stringify(connection.localDescription));
  };

  connection.ondatachannel = (event) => {
    if (event.channel.label === "chat-channel") {
      event.channel.onopen = onConnectionEstablished_chatChannel(event.channel);
    } else if (event.channel.label === "file-send-channel") {
      event.channel.onopen = onConnectionEstablished_fileSendChannel(
        event.channel
      );
    }
  };
}

function onConnectionEstablished_chatChannel(chatChannel) {
  chatChannel.onmessage = (event) => print("Received : " + event.data);
  const input = document.getElementById("input");
  input.onkeypress = (event) => {
    if (event.key !== "Enter") return;
    chatChannel.send(input.value);
    print("Sent: " + input.value);
    input.value = "";
  };
}

function onConnectionEstablished_fileSendChannel(fileSendChannel) {
  fileSendChannel.onmessage = onReceiveFileCallback;

  const input = document.getElementById("fileInput");
  input.onchange = sendFile;
}

function onReceiveFileCallback(event) {
  console.log(`Received Message ${event.data.byteLength}`);

  // the first part of the message is the filename;;;filesizeInBytes;;;<file>
  if (recievingNewFile) {
    [ fileName_recieved, fileSize_recieved ] = event.data.split(";;;");
    fileSize_recieved = parseInt(fileSize_recieved);
    recievingNewFile = false;
    return;
  }

  receiveBuffer.push(event.data);
  receivedSize += event.data.byteLength;

  console.log(`expected: ${receivedSize}, recieved: ${fileSize_recieved}`);

  if (receivedSize === fileSize_recieved) {
    const received = new Blob(receiveBuffer);
    receiveBuffer = [];

    downloadAnchor.href = URL.createObjectURL(received);
    downloadAnchor.download = fileName_recieved;
    downloadAnchor.textContent =
      `Click to download '${fileName_recieved}' (${fileSize_recieved} bytes)`;
    downloadAnchor.style.display = 'block';

    $("#fileDownloadModal").modal("show");

    // for future files
    recievingNewFile = true; 
    receivedSize = 0;
  }
}

function sendFile(e) {
  const { files } = e.target;

  if (!files.length) {
    return;
  }

  const [file] = files;
  const { name: filename } = file;

  if (file.size === 0) {
    alert("File is empty, please select a non-empty file");
    return;
  }

  const sendProgress = document.getElementById("send-progress");
  const fileSize = file.size;
  var fileReader = null;

  $("#myModal").modal("show");
  document.getElementById("myFilename").textContent = filename;
  document.getElementById("send-btn").addEventListener(
    "click",
    function () {
      // first send filename and file size.
      fileSendChannel.send(`${filename};;;${fileSize};;;`);

      const chunkSize = 16384;
      fileReader = new FileReader();

      let offset = 0;
      fileReader.addEventListener("error", (error) =>
        console.error("Error reading file:", error)
      );
      fileReader.addEventListener("abort", (event) =>
        console.log("File reading aborted:", event)
      );
      fileReader.addEventListener("load", (e) => {
        console.log("FileRead.onload ", e);
        fileSendChannel.send(e.target.result);
        offset += e.target.result.byteLength;
        sendProgress.style.width = (offset / fileSize) * 100;

        if (offset < file.size) {
          readSlice(offset);
        }
      });
      const readSlice = (o) => {
        console.log("readSlice ", o);
        const slice = file.slice(offset, o + chunkSize);
        fileReader.readAsArrayBuffer(slice);
      };
      readSlice(0);
    },
    {
      once: true,
    }
  );
}

window.onhashchange = () => location.reload();
window.onerror = (message, source, lineno, colno, error) => {
  print(error.stack);
  print("Session aborted. Refresh to start a new session.");
  input.onkeypress = undefined;
};

const connection = new RTCPeerConnection({
  iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
});

if (window.location.hash)
  runGuest(connection, window.location.hash.substring(1));
else runHost(connection);

// -----
