
# 📚 Bimarz — Books & Events Web Platform

A full-stack web application that allows users to manage books and events via a modern
React/Next.js frontend and a Django backend powered by PostgreSQL, Redis, and Nginx
with Docker-based deployment.

---

## 🚀 Live Demo
> https://bimarz.org

Access the production instance to explore UI workflows and admin features.

---

## 🧠 Overview

Bimarz (working title) is designed as a **modern content management platform** focused on
books and events. Administrators and authenticated users can create, read, update,
and delete books and events via a user-friendly web UI.

This project demonstrates full DevOps capabilities:
- Dockerized backend + frontend
- PostgreSQL database
- Redis cache
- Nginx reverse-proxy with HTTPS SSL
- CORS and secure settings
- CI-ready structure

---

## 📦 Features

### Frontend
✔ Admin UI for books & events  
✔ Next.js with App Router  
✔ API calls integrated via Axios  
✔ Secure HTTPS access  
✔ Modular React components

### Backend
✔ Django REST API  
✔ PostgreSQL integration  
✔ Redis caching configuration  
✔ Custom user model  
✔ JWT authentication  
✔ Admin interface

### DevOps
✔ Docker Compose multi-container setup  
✔ Nginx web server with SSL termination  
✔ Production environment support  
✔ Local development ready

---

## 🧰 Tech Stack
| Layer | Technology |
|------|-------------|
| Frontend | Next.js, React |
| Backend | Django, Django REST Framework |
| Database | PostgreSQL |
| Cache | Redis |
| Reverse Proxy | Nginx |
| Deployment | Docker, Docker Compose |

---

## 📥 Getting Started (Local)

### Requirements
Install:
- Docker
- Docker Compose
- Node.js & npm (for local dev)
- Python (for running locally without Docker)

### Clone

```bash
git clone https://github.com/Kandalos/bimarz.git
cd bimarz
````

### Environment Variables

Copy `.env.example`:

```bash
cp .env.example .env
```

Fill in values for:

* Django secret
* DB credentials
* Redis
* Next.js API URL

---

## 🐳 Run with Docker

**Build & start services**

```bash
docker compose up -d --build
```

**Run migrations**

```bash
docker compose exec backend python manage.py migrate
```

**Create superuser**

```bash
docker compose exec backend python manage.py createsuperuser
```

**Collect static files**

```bash
docker compose exec backend python manage.py collectstatic --noinput
```

---

## 🔐 Deployment (Ubuntu VPS)

1. Install Docker & Docker Compose
2. DNS pointing domain to VPS
3. Place SSL certs in `nginx/ssl` (can use certbot)
4. Configure environment files
5. `docker compose up -d --build`

Nginx config (mounted from `/nginx`)

---

## 📁 Environment Variables

### Backend (`.env`)

```
SECRET_KEY=...
DEBUG=False
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
DB_HOST=db
DB_PORT=5432
REDIS_URL=redis://:password@redis:6379/0
CORS_ALLOWED_ORIGINS=https://bimarz.org
ALLOWED_HOSTS=bimarz.org,www.bimarz.org
```

### Frontend (`.env.production`)

```
NEXT_PUBLIC_API_URL=https://bimarz.org/api
```

---

## 👨‍💻 Contributing

Contributions are welcome! To propose fixes or improvements:

1. Fork this repository
2. Create a new branch
3. Make your changes
4. Submit a pull request


---

## Project Architecture Diagram:

```
                                    +----------------+
                                    |   bimarz.org   |
                                    | (HTTPS via Nginx)
                                    +-------+--------+
                                            |
                         +------------------+------------------+
                         |                                     |
                +--------v-------+                    +--------v--------+
                |   frontend     |                    |    backend      |
                |  Next.js SSR   |                    |  Django REST    |
                | Docker (3000)  |                    |   API (8000)    |
                +----------------+                    +--------+--------+
                          |                                      |
                          |                                      |
                     Docker Network                          Docker Network
                          |                                      |
         +----------------+-----------------+      +--------------+-------------+
         |                                    |     |                            |
  +------v------+                     +--------v-----v--------+       +------------v-----------+
  | PostgreSQL  |                     |        Redis          |       |    static files       |
  | (bimarz_db) |                     | (cache/session)      |       |     (collected)       |
  +-------------+                     +----------------------+       +-----------------------+
```


