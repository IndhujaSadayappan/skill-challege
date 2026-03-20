# Dockerized MERN Stack Application

This project has been dockerized using Docker and Docker Compose. This ensures that the application runs consistently across different environments and simplifies the setup process.

## Prerequisites

-   [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running.

## Running the Application

To start the entire MERN stack, simply run:

```bash
docker-compose up --build
```

This command will:
1.  **Pull the MongoDB image** and start the database.
2.  **Build the Backend image** and start the server at `http://localhost:5000`.
3.  **Build the Frontend image** (using a multi-stage Nginx build) and serve it at `http://localhost:3000`.

## Services

-   **Frontend**: `http://localhost:3000`
-   **Backend**: `http://localhost:5000` (API documentation/health)
-   **MongoDB**: `mongodb://localhost:27017` (Exposed locally for debugging tools like MongoDB Compass)

## Environment Variables

The configuration is handled via environment variables in `docker-compose.yml`.

### Backend:
-   `MONGODB_URI`: Points to the MongoDB container (`mongodb:27017`).
-   `PORT`: Backend port (5000).
-   `JWT_SECRET`: Secret for signing tokens.
-   `CLIENT_URL`: The URL where the frontend is accessible.

### Frontend:
-   `REACT_APP_API_URL`: Set in `frontend/.env` before the build process.

## Data Persistence

MongoDB data is persisted using a Docker volume named `mongodb_data`, so your database content survives container restarts and upgrades.

## Stopping the Application

```bash
docker-compose down
```
