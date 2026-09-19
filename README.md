# Gemma Chatbot Client (Frontend)

This repository contains the React frontend for the Gemma Chatbot. It connects to the backend Spring Boot service to communicate with the local Gemma LLM model.

## 🚀 Prerequisites
Ensure you have the following installed on your host machine:
*   **Node.js** (v18+ recommended) and **npm**

*Note: The backend Chatbot Service (Java) from the main `TradingApp` repository must be running for full functionality.*

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

## 💾 Committing & Pushing to GitHub

To save your work and push updates to the frontend repository:

```powershell
cd C:\Development\TradingApp-Client

# View changed files
git status

# Stage all changes
git add .

# Commit changes with a descriptive message
git commit -m "feat: updated chatbot UI"

# Push to the main branch
git push origin main
```

---

## 🔌 Backend Integration
The frontend expects the Java `Chatbot Service` to be running at `http://localhost:8082`. API requests are made using Axios. Ensure CORS is enabled on the backend to allow requests from `http://localhost:3000`.