# Learning Module 01: Dockerizing a Node.js Backend

## 1. What is a Dockerfile?
A `Dockerfile` is a text document that contains all the commands a user could call on the command line to assemble an image. It is the "source code" of your infrastructure.

## 2. Key Commands Explained

### `FROM node:22-alpine`
This is our **Base Image**. Instead of building an entire Operating System from scratch, we start with a tiny, lightweight version of Linux (Alpine) that already has Node.js 22 installed.

### `WORKDIR /app`
This sets the "home directory" inside the container. All following commands will happen inside this folder.

### `COPY package*.json ./`
We copy only the `package.json` and `package-lock.json` first. 
**Why?** This is a "Docker Optimization." Docker caches each step. If your code changes but your packages don't, Docker will skip `npm install` and make your builds much faster!

### `RUN npm install --production`
This runs the installation inside the container. We use `--production` to keep the image small by skipping testing tools like `autocannon`.

### `COPY . .`
Now we copy the rest of your source code into the container.

### `EXPOSE 5000`
This is a note to the developer that the container expects traffic on port 5000.

### `CMD ["node", "index.js"]`
This is the final command that starts your server. Unlike `RUN`, this only executes when the container actually starts.

## 3. The `.dockerignore` file
Just like `.gitignore`, this tells Docker which files to **skip** when copying. We never want to copy our local `node_modules` into the container because the container will build its own version inside!
