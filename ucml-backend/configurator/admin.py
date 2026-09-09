from django.contrib import admin

from .models import Device , ConfigJob


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ["device_name", "vendor", "model", "topology", "ip_address", "created_at"]
    list_filter = ["vendor", "topology"]
    search_fields = ["device_name", "ip_address", "mac_address"]


@admin.register(ConfigJob)
class ConfigJobAdmin(admin.ModelAdmin):
    list_display=["id", "device", "status", "created_at", "updated_at"]
    list_filter=["status"]
    search_fields=["device__device_name"]
    readonly_fields = ["created_at", "updated_at"]