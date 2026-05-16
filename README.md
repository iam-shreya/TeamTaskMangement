# TeamTaskManagement 🚀

A full-stack project and task management web application built for teams.
Manage projects, assign tasks, track progress, and collaborate efficiently.

## 🌐 Live Demo
- **Frontend:** (add your Railway frontend URL here)
- **Backend API:** (add your Railway backend URL here)

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React 18 |
| Styling | Vanilla CSS |
| Backend | Django + Django REST Framework |
| Database | PostgreSQL |
| Auth | JWT (djangorestframework-simplejwt) |
| Deployment | Railway |

## ✨ Features

- 🔐 User Authentication (Signup / Login with JWT)
- 📁 Project Management (Create, View, Manage Projects)
- ✅ Task Management (Create, Assign, Update Status)
- 👥 Team Management (Create Teams, Add Members)
- 📊 Dashboard (Total Tasks, In Progress, Completed, Overdue)
- 🔒 Role-Based Access (Admin & Member roles)

## 📁 Project Structure
TeamTaskManagement/
├── client/          # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/          # Django Backend
│   ├── manage.py
│   ├── requirements.txt
│   └── ...
├── Dockerfile
├── railway.json
└── README.md

## ⚙️ Local Setup

### Backend (Django)

```bash
cd server
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend (React)

```bash
cd client
npm install
npm run dev
```

## 🔐 Environment Variables

### Backend (server/.env)
| Variable | Description |
|----------|-------------|
| SECRET_KEY | Django secret key |
| DEBUG | True for dev, False for production |
| DATABASE_URL | PostgreSQL connection URL |
| FRONTEND_URL | Frontend URL for CORS |

### Frontend (client/.env)
| Variable | Description |
|----------|-------------|
| VITE_API_URL | Backend API base URL |

## 🚀 Deployment (Railway)
1. Push code to GitHub
2. Go to railway.app → New Project → Deploy from GitHub
3. Add PostgreSQL database service
4. Set environment variables for both services
5. Backend root directory: `server`
6. Frontend root directory: `client`
7. Run migrations from Railway shell: `python manage.py migrate`

## 👥 Team Members

| Name | Role |
|------|------|
| Shreya | Full Stack Developer |
| Jatin | Backend Developer |
| Vedant | Frontend Developer |
| Alok | Database and Deployment |

## 📌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register/ | User Signup |
| POST | /api/auth/login/ | User Login |
| GET | /api/projects/ | Get all projects |
| POST | /api/projects/ | Create project |
| GET | /api/tasks/ | Get all tasks |
| POST | /api/tasks/ | Create task |
| PATCH | /api/tasks/:id/ | Update task status |
| GET | /api/teams/ | Get all teams |
