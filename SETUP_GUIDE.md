# Lockton Insurance Platform — Setup Guide

Follow these steps to download and run the application on your machine.

---

## Prerequisites

Install these before starting:

| Tool | Version | Install Command / Link |
|------|---------|----------------------|
| **Python** | 3.9+ | https://www.python.org/downloads/ |
| **Node.js** | 18+ | https://nodejs.org/ (LTS recommended) |
| **Git** | Any | https://git-scm.com/downloads |

### Verify installations:
```bash
python3 --version    # Should show 3.9 or higher
node --version       # Should show 18 or higher
npm --version        # Comes with Node.js
```

---

## Step 1: Get the Code

**Option A — If shared as a ZIP file:**
```bash
# Unzip the file
unzip Lockton.zip
cd Lockton
```

**Option B — If shared via Git:**
```bash
git clone <repository-url>
cd Lockton
```

---

## Step 2: Start the Backend

```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# If 'pip' doesn't work, try:
# python3 -m pip install -r requirements.txt

# Start the backend server
python3 main.py
```

You should see:
```
Database seeded successfully!
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Started reloader process
```

> **Keep this terminal open.** The backend runs on http://localhost:8000

> **Note:** If you get "Address already in use" error, another app is using port 8000.
> Kill it with: `lsof -ti :8000 | xargs kill` (Mac/Linux) or change the port in `main.py`

---

## Step 3: Start the Frontend

**Open a NEW terminal window/tab**, then:

```bash
# Navigate to frontend
cd Lockton/frontend

# Install JavaScript dependencies
npm install

# Start the development server
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

> **Keep this terminal open too.**

---

## Step 4: Open the Application

Open your browser and go to:

### 👉 http://localhost:5173

---

## Step 5: Login

Use any of these demo accounts:

| Role | Email | Password | Access Level |
|------|-------|----------|-------------|
| **Admin** | `admin@lockton.com` | `admin123` | Full access — all modules |
| **Broker** | `broker@lockton.com` | `broker123` | Client/policy management, no settings |
| **Client** | `client@lockton.com` | `client123` | Self-service — own policies, claims, certificates |
| **Analyst** | `analyst@lockton.com` | `analyst123` | Read-only analytics, AI assistant |

---

## What Each Role Can Access

### Admin
- Dashboard, Clients, Policies, Claims, Renewals, Carriers, Certificates
- Analytics, Documents, Workflows, AI Assistant, **Settings (User Management)**

### Broker
- Dashboard, Clients, Policies, Claims, Renewals, Carriers, Certificates
- Analytics, Documents, Workflows, AI Assistant

### Client
- Dashboard, Policies, Claims, Certificates, Documents

### Analyst
- Dashboard, Clients (read-only), Policies, Claims, Analytics, AI Assistant

---

## Troubleshooting

### "Invalid email or password"
- Make sure the **backend** is running (check the terminal for errors)
- If you see a different app on port 8000, kill it and restart the Lockton backend

### Backend won't start
```bash
# If bcrypt errors, install compatible version:
pip install bcrypt==4.0.1

# If port 8000 is busy:
lsof -ti :8000 | xargs kill
python3 main.py
```

### Frontend won't start
```bash
# If npm install fails, clear cache:
rm -rf node_modules package-lock.json
npm install

# If port 5173 is busy:
npx vite --port 3000
```

### Charts not showing data
- Make sure the backend is running and seeded
- Delete `backend/lockton.db` and restart the backend to re-seed

### AI Assistant responses are generic
- The AI works without an OpenAI API key (uses built-in fallback responses)
- For full AI capabilities, create a `.env` file in the `backend/` folder:
  ```
  OPENAI_API_KEY=sk-your-key-here
  ```

---

## Sharing the Application

### Option 1: ZIP file (simplest)
```bash
# From the parent directory of Lockton:
cd ..

# Create ZIP (excluding generated files)
zip -r Lockton.zip Lockton/ \
  -x "Lockton/frontend/node_modules/*" \
  -x "Lockton/frontend/dist/*" \
  -x "Lockton/backend/lockton.db" \
  -x "Lockton/backend/uploads/*" \
  -x "Lockton/backend/__pycache__/*" \
  -x "Lockton/backend/**/__pycache__/*"
```

Share the `Lockton.zip` file. Recipients follow this guide from Step 1.

### Option 2: GitHub
```bash
cd Lockton
git init
git add .
git commit -m "Lockton Insurance Platform"
# Create a repo on GitHub, then:
git remote add origin https://github.com/your-username/lockton-platform.git
git push -u origin main
```

Share the GitHub URL. Recipients `git clone` and follow from Step 2.

---

## Stopping the Application

- **Backend**: Press `Ctrl+C` in the backend terminal
- **Frontend**: Press `Ctrl+C` in the frontend terminal
