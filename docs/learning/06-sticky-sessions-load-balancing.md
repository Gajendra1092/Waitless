# Learning Module 06: Sticky Sessions & Socket.io

## 1. The Problem: The "400 Bad Request" in a Cluster
Socket.io starts a connection with an HTTP handshake. In a default Nginx setup, requests are sent to servers in a "Round Robin" fashion (Server 1, then Server 2, then Server 3).

1. Client sends Handshake to **Server 1**. Server 1 creates a session ID (`sid`).
2. Client sends a follow-up request to continue the connection.
3. Nginx sends this second request to **Server 2**.
4. **Server 2** rejects it because it doesn't recognize that session ID.

## 2. The Solution: `ip_hash`
By adding `ip_hash;` to the Nginx `upstream` block, we tell Nginx to use the client's IP address as a key. This ensures that the same user always hits the same server.

```nginx
upstream waitless_api {
    ip_hash; # This is the magic line
    server api:5000;
}
```

## 3. Best Practice: Direct WebSocket Transport
By default, Socket.io tries "Long Polling" first and then upgrades to "WebSockets". In production clusters, it is often more stable to force the client to use WebSockets immediately:

```javascript
const socket = io(URL, {
  transports: ['websocket']
});
```
This avoids the multi-request handshake entirely, making the connection faster and more reliable.
