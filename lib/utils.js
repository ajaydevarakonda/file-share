function print(str) {
  const output = document.getElementById("output");
  output.append(str + "\r\n");
  output.scrollTop = output.scrollHeight;
}
