import { io } from 'socket.io-client';

const URL = process.env.REACT_APP_SERVER_URL;
export const socket = io(URL, {
  autoConnect: false,
  transports: ['websocket'] // Force WebSockets only
});
