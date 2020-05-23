import React from 'react';
import MessageSent from './MessageSent';
import MessageReceived from './MessageReceived';

function MessageBox() {
    return(
        <div className="container MessageBox">
            <br/>
            <div className="thanks">Thanks for using fileshare! Bookmark the site using ctrl + d and share with your firends.</div>
            <MessageSent />
            <MessageReceived />
        </div>
    );
}

export default MessageBox;