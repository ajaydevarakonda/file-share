function print(str) {
  const output = document.getElementById("output");
  output.append(str + "\r\n");
  output.scrollTop = output.scrollHeight;
}

async function runHost(connection) {
  print("Initializing...");
  const dataChannel = connection.createDataChannel(null);
  dataChannel.binaryType = 'arraybuffer';

  dataChannel.onopen = (event) => onConnectionEstablished(dataChannel);
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
    event.channel.onopen = onConnectionEstablished(event.channel);
  };
}

function onConnectionEstablished(dataChannel) {
  dataChannel.onmessage = (event) => print("Received : " + event.data);
  const input = document.getElementById("input");
  input.onkeypress = (event) => {
    if (event.key !== "Enter") return;
    dataChannel.send(input.value);
    print("Sent: " + input.value);
    input.value = "";
  };
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

