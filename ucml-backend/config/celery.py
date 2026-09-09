import os

from celery import Celery 

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app=Celery("config")

# Read CELERY_-prefixed settings from Django's settings.py
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks.py files inside each installed app (accounts, configurator, etc.)
app.autodiscover_tasks()