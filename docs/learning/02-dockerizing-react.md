# Learning Module 02: Dockerizing a React Frontend

## 1. The Multi-Stage Build Strategy
Production Dockerfiles for frontends usually have two "Stages". Think of it like a rocket:
1. **The Booster (Build Stage):** Needs lots of fuel (Node.js, npm install, build tools) to get the code compiled.
2. **The Satellite (Production Stage):** Once in orbit, we drop the heavy booster and keep only the tiny satellite (the compiled HTML/JS files) inside a tiny Nginx server.

## 2. Key Commands Explained

### `FROM node:22-alpine AS build-stage`
The `AS build-stage` gives this part of the process a name so we can reference it later.

### `RUN npm run build`
This is the most important command. It takes your React components and turns them into raw, optimized HTML, CSS, and JS files that any browser can understand.

### `FROM nginx:stable-alpine`
We switch to a new image! This one doesn't even have Node.js. It only has Nginx, which is the world's fastest web server for serving static files.

### `COPY --from=build-stage /app/build /usr/share/nginx/html`
This is the "hand-off." We tell Docker: "Go back to the `build-stage` folder, find the `/app/build` directory, and copy its contents into the Nginx folder where it serves website files."

### `EXPOSE 80`
Nginx serves traffic on the standard HTTP port 80.

### `CMD ["nginx", "-g", "daemon off;"]`
This starts Nginx in the foreground so the container keeps running.
