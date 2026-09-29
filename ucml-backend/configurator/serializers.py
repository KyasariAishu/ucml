from rest_framework import serializers

from .models import Device, ConfigJob

class DeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Device
        fields = [
            "id",
            "device_name",
            "device_type",
            "vendor",
            "model",
            "topology",
            "port_no",
            "ip_address",
            "subnet_mask",
            "gateway",
            "mac_address",
            "local_as",
            "system_ip",
            "customer_vrf_id",
            "customer_vrf_name",
            "created_at",
        ]
        read_only_fields = ["id", "created_at","updated_at"]

class ConfigJobSerializer(serializers.ModelSerializer):

    class Meta:
        model= ConfigJob
        fields=["id", "device", "status", "generated_config", "error_message", "created_at", "updated_at"]
        read_only_fields = fields 

        
class DeviceUpdateSerializer(serializers.ModelSerializer):
    class Meta: 
        model=Device
        fields=["id", "device_name", "device_type", "vendor", "model", "topology",
            "port_no", "ip_address", "subnet_mask", "gateway", "mac_address",
            "local_as", "system_ip", "customer_vrf_id", "customer_vrf_name",
            "created_at",]
        read_only_fields = ["id", "created_at", "vendor", "model","updated_at"]