# ADR 007: Access and Refresh Token Authentication

## Status
Proposed

## Context
The previous authentication system used a single, long-lived JWT stored in LocalStorage. This is vulnerable to:
1. **XSS Attacks:** Malicious scripts can read LocalStorage and steal the token.
2. **No Revocation:** Once a token is issued, it cannot be invalidated until it expires naturally.
3. **CSRF Risk:** If stored in a simple cookie, the browser automatically attaches it to malicious cross-site requests.

## Decision
We will implement a **Dual-Token Split Architecture**:
1. **Access Token (Short-lived, ~15m):** Stored in frontend memory. Sent via `Authorization: Bearer` header. Defeats CSRF because browsers do not automatically attach headers.
2. **Refresh Token (Long-lived, ~7d):** Stored in a `HttpOnly`, `Secure` cookie. Defeats XSS because JavaScript cannot read it.
3. **Backend Storage:** Valid Refresh Tokens will be stored in **Redis** with a TTL matching the token expiry. This allows for instant session revocation.

## Consequences
- **Pros:** 
    - Immune to XSS token theft.
    - Protected against CSRF data modification.
    - Enables "Logout from all devices" by clearing Redis.
- **Cons:** 
    - Increased complexity on the frontend (Axios Interceptors).
    - Requires a Redis lookup on the `/refresh` endpoint.
- **Trade-off:** We prioritized absolute security and control over simplicity.
