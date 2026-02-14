# Lockton Insurance Management Platform

A comprehensive insurance management GUI application built with React, TypeScript, Tailwind CSS, and FastAPI.

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```
Backend runs on **http://localhost:8000**. Database is auto-seeded with demo data on first run.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on **http://localhost:5173** with API proxy to backend.

## Demo Accounts

| Role    | Email               | Password   |
|---------|---------------------|------------|
| Admin   | admin@lockton.com   | admin123   |
| Broker  | broker@lockton.com  | broker123  |
| Client  | client@lockton.com  | client123  |
| Analyst | analyst@lockton.com | analyst123 |

## Modules

- **Dashboard** — KPI cards, charts (policy distribution, premium trends, claims, renewals)
- **Client Management** — CRUD, risk scoring, cross-sell opportunities, retention risk
- **Policy Management** — Multi-carrier view, advanced filtering, policy comparison
- **Claims Management** — Status workflow (Filed→Review→Approved/Denied→Paid), fraud scoring, analytics
- **Renewal Management** — Kanban board, 90/60/30 day alerts, priority tracking
- **Carrier Management** — Directory, performance metrics, commission tracking, API integration status
- **Certificate Management** — Generate COIs, preview, bulk generation
- **Analytics & BI** — Loss ratio, broker productivity, revenue forecast, interactive charts
- **Document Vault** — Upload, categorize, search, version tracking
- **Workflow Automation** — Visual workflow builder, task management, pre-built templates
- **AI Assistant** — Chat interface, contextual help, risk assessment, document analysis
- **Settings** — User management (RBAC), roles & permissions, audit log

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Recharts, React Router, Lucide Icons
- **Backend**: Python FastAPI, SQLAlchemy ORM, Pydantic v2
- **Database**: SQLite (dev) / PostgreSQL-ready schema
- **Auth**: JWT with role-based access control (Admin, Broker, Client, Analyst)
- **AI**: OpenAI API integration (gracefully degrades without API key)

## API Endpoints

All endpoints at `/api/*`:
- `POST /api/auth/login` — JWT login
- `GET /api/auth/me` — Current user
- `GET/POST /api/clients` — Client CRUD
- `GET/POST /api/policies` — Policy CRUD
- `GET/POST /api/claims` — Claims with analytics
- `GET/POST /api/carriers` — Carrier management
- `GET/POST /api/renewals` — Renewal pipeline
- `GET/POST /api/certificates` — Certificate generation
- `GET /api/analytics/*` — Dashboard, loss ratio, broker productivity, revenue forecast
- `POST /api/documents` — File upload
- `GET/POST /api/workflows` — Workflow management
- `POST /api/ai/chat` — AI assistant
- `GET /api/notifications` — System notifications
