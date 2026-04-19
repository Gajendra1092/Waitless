# Learning Module 05: React Client Routing & Nginx

## 1. The Problem: The "404 Not Found" Error
When using React Router, navigating to a path like `/display/123` works fine if you click a link *inside* the app. But if you refresh the page or type the URL directly into the address bar, Nginx returns a **404 Not Found**.

**Why?**
Nginx is a file server. When you ask for `/display/123`, it looks for a folder named `display` and a file named `123` inside your container. Since React is a Single Page Application, that file doesn't actually exist on the disk!

## 2. The Solution: The `try_files` Fallback
To fix this, we provided Nginx with a custom configuration:

```nginx
location / {
    root /usr/share/nginx/html;
    index index.html index.htm;
    try_files $uri $uri/ /index.html;
}
```

### How `try_files` works:
1. **`$uri`**: Nginx first checks if the file exists (e.g., `logo.png`).
2. **`$uri/`**: Then it checks if a directory exists.
3. **`/index.html`**: If neither is found, it "gives up" and just serves the main `index.html` file.

Once `index.html` loads in the browser, the React code kicks in, looks at the URL, and says, "Oh, you want the Display Page for Queue 123! I'll show that now."

## 3. Implementation Recap
1. Create `client/nginx.conf`.
2. Update `client/Dockerfile` to copy this config to `/etc/nginx/conf.d/default.conf`.
3. Rebuild the image so Nginx knows to use the new rules.
