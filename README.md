# Trading Application Client (Frontend)

This repository contains the React + Redux frontend for the Trading Application. It connects to the backend analysis service to generate trading strategies via LLMs (Pine Script & Python) and displays the backtesting results.

## 🚀 Prerequisites
Ensure you have the following installed on your host machine:
*   **Node.js** (v18+ recommended) and **npm**
*   (Optional) **Docker Desktop** (if you prefer to run it containerized)

*Note: The backend microservices (Java & Python) from the main `TradingApp` repository must be running for full functionality.*

## 🏃 Getting Started (Local Development)

### 1. Install Dependencies
Open a terminal and navigate to the project directory:
```powershell
cd C:\Development\TradingApp-Client
npm install
```

### 2. Start the React Application
```powershell
npm start
```
The application will open in your default browser at `http://localhost:3000`. Hot-reloading is enabled, so changes to the code will immediately reflect in the browser.

---

## 🐳 Getting Started (Docker)

If you prefer to run the frontend isolated in a Docker container:
```powershell
cd C:\Development\TradingApp-Client
docker build -t trading-app-client .
docker run -p 3000:3000 trading-app-client
```

---

## 💾 Committing & Pushing to GitHub

To save your work and push updates to the frontend repository:

```powershell
cd C:\Development\TradingApp-Client

# View changed files
git status

# Stage all changes
git add .

# Commit changes with a descriptive message
git commit -m "feat: updated frontend UI"

# Push to the main branch
git push origin main
```

---

## 🔌 Backend Integration
The frontend expects the Java `Analysis Service` to be running at `http://localhost:8082`. API requests are made using Axios in the Redux slices (e.g., `src/features/strategySlice.js`). Ensure CORS is enabled on the backend to allow requests from `http://localhost:3000`.