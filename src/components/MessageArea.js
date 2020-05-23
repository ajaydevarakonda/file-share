import React from 'react';
import MessageBox from './MessageBox';
import MessageInput from './MessageInput';

function MessageArea() {
  return (
    <div className="MessageArea">
        <MessageBox />
        <MessageInput />
    </div>
  );
}

export default MessageArea;
