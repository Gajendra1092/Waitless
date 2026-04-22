# 🚀 WaitLess: AI-Powered Smart Queue Management System

WaitLess is a high-performance, real-time queue management solution designed to eliminate physical waiting lines. It provides business owners with AI-driven insights to optimize efficiency and gives customers a seamless, "wait-anywhere" experience via real-time WebSocket updates.

![WaitLess Banner](https://img.shields.io/badge/Status-Production--Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-orange)

---

## ✨ Key Features

- **🤖 AI Smart Insights**: Integrated with **Gemini 3 Flash**, providing actionable business intelligence and bottleneck analysis.
- **⚡ Real-Time Updates**: Instant queue position updates using **Socket.io** and **Redis Adapter**.
- **📈 Advanced Analytics**: Interactive charts showing traffic trends and queue distribution.
- **🔄 Scalable Architecture**: Nginx load-balanced backend cluster with background workers for asynchronous tasks (SMS/Email).
- **📱 Responsive UI**: Beautifully crafted dashboard using React and Material UI with a modern "Glassmorphism" theme.

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (Functional Components, Hooks)
- **Material UI** (Custom Theme, Responsive Design)
- **Recharts** (Data Visualization)
- **Socket.io-client** (Real-time events)

### Backend
- **Node.js & Express**
- **MongoDB & Mongoose** (Database)
- **Redis** (Caching & WebSocket State)
- **BullMQ** (Asynchronous Job Processing)
- **Google Gemini API** (Business Intelligence)

### DevOps & Infrastructure
- **Nginx** (Reverse Proxy & Load Balancing)
- **Docker & Docker Compose**
- **GitHub Actions** (CI/CD Ready)

---


## 🚀 Deployment Guide

### 1. Local Development (Docker)
Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.

```bash
# Clone the repository
git clone https://github.com/Gajendra1092/Waitless.git
cd Waitless

# Setup environment variables
# Copy .env.example to server/.env and fill in your GEMINI_API_KEY
cp .env.example server/.env

# Start the cluster
docker-compose up --build

# (Optional) Seed the database with 50,000+ customers
docker exec -it waitless-api-1 node scripts/seed.js
```

### 2. Production Deployment (VPS)
On a VPS (Ubuntu/Debian), ensure Docker and Nginx are installed.

1.  **Clone & Configure**: Follow the local steps but use your VPS IP in the `CLIENT_URL`.
2.  **Firewall**: Open ports `80` (HTTP) and `443` (HTTPS).
3.  **SSL**: Use Certbot with Nginx to enable HTTPS.
4.  **Launch**: `docker-compose -f docker-compose.yml up -d`

### 3. Cloud Deployment (Render & Vercel Free Tier)

#### **Backend (Render)**
1.  **Create a Web Service**: Connect your GitHub repo.
2.  **Build Command**: `npm install`
3.  **Start Command**: `node worker.js & node index.js`
4.  **Environment Variables**: Add all variables from `.env.example`.
5.  **Redis**: Use Render's managed Redis or Upstash (ensure you use `rediss://` for TLS).

#### **Frontend (Vercel)**
1.  **Connect Repo**: Import the `client` directory.
2.  **Framework Preset**: Create React App.
3.  **Environment Variables**: Set `REACT_APP_API_URL` to your Render backend URL.

---

## 📝 License
Distributed under the MIT License. See `LICENSE` for more information.

---

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Developed with ❤️ by the WaitLess Team.**
