# E-commerce Platform

Full-stack e-commerce application built with Django REST Framework and modern frontend technologies.

## 📁 Project Structure

```
ecommerce/
├── backend/          # Django REST API
│   ├── ecommerce/    # Django project settings
│   ├── users/        # User authentication & profiles
│   ├── shop/         # Product catalog
│   ├── orders/       # Order management
│   ├── payments/     # Stripe payment integration
│   ├── core/         # Shared utilities
│   └── media/        # Uploaded files
│
└── frontend/         # Frontend application (to be implemented)
```

## 🚀 Quick Start

### Backend (Django REST API)

```bash
cd backend
docker-compose up --build
```

The API will be available at:
- **API**: http://localhost:8000
- **Admin**: http://localhost:8000/admin
- **Swagger**: http://localhost:8000/swagger
- **Adminer**: http://localhost:8080

### Frontend

```bash
cd frontend
# Instructions to be added when frontend is implemented
```

## 📚 Documentation

- [Backend README](./backend/README.md) - Django API documentation
- [Frontend README](./frontend/README.md) - Frontend documentation

## 🛠️ Tech Stack

### Backend
- Django 6.0
- Django REST Framework
- PostgreSQL 15
- Stripe for payments
- Docker & Docker Compose

### Frontend
- To be determined

## 👥 Team

ESILV M1 - Web Architecture Project

## 📄 License

This project is part of an academic curriculum.
