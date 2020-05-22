window.onhashchange = () => location.reload();
window.onerror = (message, source, lineno, colno, error) => {
  print(error.stack);
  print("Session aborted. Refresh to start a new session.");
  input.onkeypress = undefined;
};

if (window.location.hash) {
    // guest
    const client = new Guest(window.location.hash.substring(1));
} else {
    // host
    const client = new Host();
}

