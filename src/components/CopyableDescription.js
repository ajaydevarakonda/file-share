import React from "react";
import Button from "react-bootstrap/Button";

class CopyableDescription extends React.Component {
  constructor(props) {
    super(props);

    this.textInput = React.createRef();

    this.copyText = this.copyText.bind(this);
  }

  copyText() {
    this.textInput.current.select();
    this.textInput.current.setSelectionRange(0, 99999); /*For mobile devices*/

    /* Copy the text inside the text field */
    document.execCommand("copy");

    /* Alert the copied text */
    alert("Copied!");
  }

  render() {
    return (
      <p className="CopyableDescription">
        <input type="text" ref={this.textInput} value={this.props.value} />
        <Button className="CopyableBtn" variant="link" onClick={this.copyText}>
          Copy
        </Button>
      </p>
    );
  }
}

export default CopyableDescription;
