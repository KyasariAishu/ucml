from pathlib import Path

from celery import shared_task
from jinja2 import Environment, FileSystemLoader, TemplateNotFound

from .models import ConfigJob 

TEMPLATE_DIR = Path(__file__).resolve().parent / "templates" / "configs"

jinja_env = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)))


@shared_task
def generate_device_config(job_id):
    job = ConfigJob.objects.get(id=job_id)
    job.status = ConfigJob.Status.RUNNING
    job.save(update_fields=["status"])

    device = job.device
    template_path = f"{device.vendor.lower()}.j2"

    # Map our Device model's field names to the names the template
    # actually uses -- keeps the template readable in network-engineer
    # language, independent of Django's internal field names.
    context = {
        "node_name": device.device_name,
        "topology_role": device.topology,
        "local_as": device.local_as,
        "system_ip": device.system_ip,
        "customer_vrf_id": device.customer_vrf_id,
        "customer_vrf_name": device.customer_vrf_name,
        "port_no": device.port_no,
    }

    try:
        template = jinja_env.get_template(template_path)
        rendered = template.render(**context)
    except TemplateNotFound:
        job.status = ConfigJob.Status.FAILED
        job.error_message = f"No template for vendor '{device.vendor}' (expected configs/{template_path})"
        job.save(update_fields=["status", "error_message"])
        ConfigJob.objects.filter(device=device, status=ConfigJob.Status.FAILED).exclude(id=job.id).delete()
        return
    except Exception as exc:
        job.status = ConfigJob.Status.FAILED
        job.error_message = str(exc)
        job.save(update_fields=["status", "error_message"])
        ConfigJob.objects.filter(device=device, status=ConfigJob.Status.FAILED).exclude(id=job.id).delete()
        return

    job.generated_config = rendered
    job.status = ConfigJob.Status.SUCCESS
    job.save(update_fields=["generated_config", "status"])

    # Keep only the latest config per device -- clear out every other
    # job (past successes and failures) now that this one succeeded.
    ConfigJob.objects.filter(device=device).exclude(id=job.id).delete()


# Celery worker don't run inside the runserver it runs parallel . it is seperate process that keeps running alongside it

# celery -A config worker -l info --pool=solo
# Celery is a command line tool . -A config means look for -app=config this tell celery where to find the celery application 

# worker — the subcommand telling Celery to start a worker process. This is the process that actually pulls tasks off the queue (RabbitMQ, in your case) and executes them


# solo means the worker runs tasks one at a time, in a single process, with no child processes or threads.



# You can also literally start multiple worker processes, each listening to the same queue(s) in RabbitMQ. This is closer to what you were imagining:
# celery -A config worker -l info --pool=solo -n worker1@%h
# celery -A config worker -l info --pool=solo -n worker2@%h
# celery -A config worker -l info --pool=solo -n worker3@%h

# You genuinely want separate OS processes (isolation, one crashing doesn't kill others)
# You're distributing across actual different machines/servers (each server runs its own celery worker command, all pointed at the same RabbitMQ instance)
# You want per-worker control (e.g., worker1 only handles queue "emails", worker2 only handles queue "reports")