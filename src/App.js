import React from 'react';
import logo from './logo.svg';
import NavigationBar from './components/NavigationBar';
import MessageArea from './components/MessageArea';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <div className="App">
      <NavigationBar />
      <MessageArea />
    </div>
  );
}

export default App;
