# Learning Module 09: JWT Security & Dual-Token Architecture

## 1. Why we split the tokens
The core of this architecture is **Defense in Depth**. By separating "Access" from "Session State", we nullify the two biggest web attacks:

### Against XSS (Cross-Site Scripting)
If a hacker injects JavaScript into your page, they can search for tokens.
- **The Defense:** The **Refresh Token** is in a cookie with the `HttpOnly` flag. Browsers block JavaScript from reading these cookies. The hacker leaves empty-handed.

### Against CSRF (Cross-Site Request Forgery)
If a user visits a malicious site while logged into Waitless, that site can try to send a request to your API.
- **The Defense:** The **Access Token** is required for all data changes (Delete Queue, etc.). Since this token is NOT a cookie, the browser will NOT automatically attach it to the malicious request. The attack fails because the request is "Unauthorized".

## 2. The Silent Refresh Flow
How do we keep the user logged in if the Access Token expires every 15 minutes?

1. **401 Unauthorized:** The frontend tries to call the API with an expired Access Token. The server rejects it.
2. **The Interceptor:** Our frontend code (Axios Interceptor) catches this 401 error.
3. **Secret Handshake:** The interceptor pauses all user requests and calls `/api/business/refresh`.
4. **Validation:** The server reads the `HttpOnly` cookie, checks Redis to see if it's still valid, and issues a brand new Access Token.
5. **Retry:** The interceptor updates the token in memory and automatically retries the original request.
**Result:** The user never sees a loading spinner or a logout screen. It happens in milliseconds.

## 3. Storage & Revocation
- **Access Token:** Stored in memory (variable) or LocalStorage (for convenience, protected by its short life).
- **Refresh Token:** Stored in **Redis**. 
- **Logout:** When a user logs out, we delete the token from Redis. Even if a hacker stole the cookie, it would be useless because the server now sees it as "Revoked".
