from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

class Device(models.Model):
    class Vendor(models.TextChoices):
        NOKIA = "NOKIA", "Nokia"
        CISCO = "CISCO", "Cisco"
        CIENA = "CIENA", "Ciena"

    class Topology(models.TextChoices):
        B4A = "B4A", "B4A"
        B4B = "B4B", "B4B"
        B4C = "B4C", "B4C"
        B4E = "B4E", "B4E"

    device_name = models.CharField(max_length=100)
    device_type = models.CharField(max_length=100)
    vendor = models.CharField(max_length=20, choices=Vendor.choices)
    model = models.CharField(max_length=100)  # e.g. "7750 SR8", "7250 IXR-S"
    topology = models.CharField(max_length=10, choices=Topology.choices)

    port_no = models.CharField(max_length=50)
    ip_address = models.GenericIPAddressField()
    subnet_mask = models.PositiveSmallIntegerField(
    validators=[MinValueValidator(0), MaxValueValidator(32)],
    help_text="CIDR prefix length, e.g. 24 for a /24 subnet",
    )
    gateway = models.GenericIPAddressField()
    mac_address = models.CharField(max_length=17)  # e.g. "00:1A:2B:3C:4D:5E"

    local_as = models.PositiveIntegerField(null=True, blank=True, help_text="BGP AS number (core/border roles)")
    system_ip = models.GenericIPAddressField(null=True, blank=True, help_text="Loopback/system interface IP")
    customer_vrf_id = models.CharField(max_length=50, blank=True, help_text="VPRN service id (edge roles only)")
    customer_vrf_name = models.CharField(max_length=100, blank=True, help_text="VRF name (edge roles only)")
    # created_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"{self.device_name} ({self.vendor})"



class ConfigJob(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        RUNNING = "RUNNING", "Running"
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"

    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name="config_jobs")
    # related_name="config_jobs" — lets you write device.config_jobs.all() later to see every config ever generated for a device.
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    generated_config = models.TextField(blank=True)
    error_message = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Job #{self.id} for {self.device.device_name} ({self.status})"
