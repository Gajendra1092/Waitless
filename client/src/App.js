import React, { useEffect } from 'react';
import './App.css';
import { socket } from './socket';

function App() {
  useEffect(() => {
    socket.connect();
    console.log('Attempting to connect to socket server...');

    function onConnect() {
      console.log('Socket connected:', socket.id);
    }

    function onDisconnect() {
      console.log('Socket disconnected');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>WaitLess</h1>
      <p>This is the client application. Check the console for socket status.</p>
    </div>
  );
}

export default App;

