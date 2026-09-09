from .celery import app as celery_app

__all__ = ("celery_app",)


# This makes sure Celery's app object is created the moment Django starts up, so @shared_task-decorated functions 
# (which we'll write next) get registered properly.