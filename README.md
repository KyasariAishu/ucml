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

## Prerequisites

Install these before starting:

- **Python 3.10+**
- **Node.js** (LTS version) — includes npm
- **PostgreSQL** — https://www.postgresql.org/download/
- **RabbitMQ** — requires Erlang first. On Windows, check RabbitMQ's
  [compatibility page](https://www.rabbitmq.com/docs/which-erlang) before
  installing Erlang -- a too-new Erlang version will make RabbitMQ crash
  on startup.

## Backend setup

```bash
cd ucml-backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### Environment variables

Copy `.env.example` to `.env` in `ucml-backend/`, and fill in real values:

DJANGO_SECRET_KEY=
DB_NAME=ucml_db
DB_USER=postgres
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432


`DJANGO_SECRET_KEY` can be any random string for local dev — Django generates
one automatically when a new project is created via `startproject`, but any
sufficiently random value works.

### Database

Create the database in PostgreSQL (via `psql` or pgAdmin):

```sql
CREATE DATABASE ucml_db;
```

Then run migrations and create an admin user:

```bash
python manage.py migrate
python manage.py createsuperuser
```

You'll be prompted for an **email** and password (not a username — this
project uses email-based login).

### RabbitMQ

Start the RabbitMQ service if it isn't already running:

```bash
# Windows, as Administrator
net start RabbitMQ
```

Verify it's running at http://localhost:15672 (default login `guest`/`guest`).

## Running the project

Three separate processes need to run at the same time, each in its own
terminal:

**1. Django server**
```bash
cd ucml-backend
venv\Scripts\activate
python manage.py runserver
```

**2. Celery worker** — picks up config-generation jobs from RabbitMQ
```bash
cd ucml-backend
venv\Scripts\activate
celery -A config worker -l info --pool=solo
```
`--pool=solo` is required on Windows. Note: the worker does **not**
auto-reload on code changes — restart it manually after editing
`tasks.py` or anything it imports.

**3. React frontend**
```bash
cd ucml-auth-ui
npm install   # first time only
npm run dev
```
Visit http://localhost:5173.

## Admin site

http://127.0.0.1:8000/admin/ — log in with the superuser created above.
Useful for inspecting devices and config jobs directly.

## Notes

- Vendor and topology are fixed choices (Nokia/Cisco/Ciena;
  B4A/B4B/B4C/B4E), not editable data.
- Only the most recent successful config is kept per device — generating
  a new one deletes the previous job for that device.
- `.env` is gitignored and never committed; `.env.example` documents the
  required keys without real values.