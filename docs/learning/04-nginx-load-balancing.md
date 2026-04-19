# Learning Module 04: Nginx Load Balancing

## 1. What is a Reverse Proxy?
A **Forward Proxy** (like a VPN) hides the *Client*. 
A **Reverse Proxy** (like Nginx) hides the *Server*. 

Users think they are talking to one giant website, but Nginx is actually distributing their requests to a "Cluster" of smaller servers behind the scenes.

## 2. Key Concepts Explained

### `upstream`
This block defines our "Server Pool". We list all the server instances here.
- **Example:**
  ```nginx
  upstream backend_servers {
      server api:5000;
  }
  ```
- *Magic Tip:* In Docker Compose, if we scale a service, Nginx can automatically find all instances!

### `proxy_pass`
This tells Nginx where to send the traffic.
- **Example:** `proxy_pass http://backend_servers;`

### `proxy_set_header`
Since Nginx is now the "middleman", we need to tell it to pass the user's real IP address and original host info to the Node.js server, otherwise your logs will show every user as `127.0.0.1`.

## 3. WebSocket Support
WebSockets are special because they are long-lived connections. Standard Nginx config will drop them. We must add `Upgrade` and `Connection` headers to ensure your real-time updates still work through the proxy.
