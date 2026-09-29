# UCML

A mockup for a network configuration management tool. Given a device's
parameters (vendor, model, topology, IPs, etc.), it generates a
vendor-correct configuration file using Jinja2 templates, processed
asynchronously via Celery and RabbitMQ.

## Structure

- `ucml-backend/` — Django REST API, PostgreSQL, Celery tasks, Jinja2 templates
- `ucml-auth-ui/` — React frontend (Vite)

## Stack

- Backend: Django, Django REST Framework, PostgreSQL, Celery, RabbitMQ, Jinja2
- Frontend: React, Vite
- Auth: JWT (djangorestframework-simplejwt)