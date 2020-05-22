function print(str) {
  const output = document.getElementById("output");
  output.append(str + "\r\n");
  output.scrollTop = output.scrollHeight;
}

async function runHost(connection) {
  print("Initializing...");
  
  // ---- chat channel ----
  const chatChannel = connection.createDataChannel("chat-channel");
  chatChannel.onopen = (event) => onConnectionEstablished_chatChannel(chatChannel);

  // ---- file send channel ----
  const fileSendChannel = connection.createDataChannel("file-send-channel");
  fileSendChannel.binaryType = 'arraybuffer';
  fileSendChannel.onopen = (event) => onConnectionEstablished_fileSendChannel(fileSendChannel);

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
      event.channel.onopen = onConnectionEstablished_fileSendChannel(event.channel);
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
  fileSendChannel.onmessage = (event) => print("File Received : " + event.data);
  // const input = document.getElementById("input");
  // input.onkeypress = (event) => {
  //   if (event.key !== "Enter") return;
  //   fileSendChannel.send(input.value);
  //   print("Sent: " + input.value);
  //   input.value = "";
  // };
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

document.getElementById("fileInput").addEventListener("change", function (e) {
  const { files } = e.target;

  if (!files.length) {
    return;
  }

  const [ file ] = files;
  const { name: filename } = file;

  $('#myModal').modal('show');
  document.getElementById("myFilename").textContent = filename;
  document.getElementById("send-btn").addEventListener("click", function() {
    alert("Will send this file!");
  }, {
      once: true
  })
});

