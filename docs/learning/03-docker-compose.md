# Learning Module 03: The Orchestrator (Docker Compose)

## 1. What is Docker Compose?
If a `Dockerfile` is a blueprint for a single brick, `docker-compose.yml` is the blueprint for the entire building. It defines how multiple containers interact, share networks, and persist data.

## 2. Key Concepts Explained

### `services`
Each item under `services` is an independent container. We have `api`, `client`, `mongodb`, and `redis`.

### `depends_on`
This tells Docker the startup order. The `api` service shouldn't start until `mongodb` and `redis` are ready.

### `environment`
This is how we pass configuration to our containers.
- **Example:** `MONGO_URI: mongodb://mongodb:27017/waitless`
- Notice we use `mongodb` (the service name) instead of `localhost`.

### `volumes`
By default, if a container is deleted, all its data is gone. **Volumes** map a folder on your physical computer to a folder inside the container.
- **Example:** `./data/db:/data/db` ensures your MongoDB records stay safe even if you stop Docker.

### `networks`
Docker Compose creates a private virtual network. Containers inside this network can "see" each other, but the outside world can't see them unless we explicitly `expose` a port.

## 3. The Lifecycle Commands
- `docker-compose up -d`: Starts the whole stack in the background ("Detached" mode).
- `docker-compose down`: Stops and removes all containers.
- `docker-compose logs -f`: Shows you the combined logs of every container in the team.
