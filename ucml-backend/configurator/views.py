from django.shortcuts import render

from rest_framework import permissions, generics 

from .serializers import DeviceSerializer , ConfigJobSerializer, DeviceUpdateSerializer
from .models import Device, ConfigJob

from rest_framework.response import Response 
from rest_framework.views import APIView 
from .tasks import generate_device_config
from django.shortcuts import get_object_or_404 
# Create your views here.

class DeviceListCreateView(generics.ListCreateAPIView):
    queryset = Device.objects.all().order_by("-created_at")
    serializer_class = DeviceSerializer
    permission_class = [permissions.IsAuthenticated]

class GenerateConfigView(APIView):
    permission_classes=[permissions.IsAuthenticated]
    """POST here to kick off config generation for a device."""
    def post(self,request,device_id):
        device = get_object_or_404(Device, id=device_id)
        job =  ConfigJob.objects.create(device=device)
        generate_device_config.delay(job.id) 

        return Response(ConfigJobSerializer(job).data,status=202)

class ConfigJobDetailView(generics.RetrieveAPIView):
    """GET here to check a job's status / fetch the generated config."""
    queryset=ConfigJob.objects.all()
    serializer_class=ConfigJobSerializer
    permission_class= [permissions.IsAuthenticated]


class DeviceDetailView(generics.RetrieveUpdateAPIView):
    """GET to fetch one device, PATCH to update its editable fields."""
    queryset=Device.objects.all()
    serializer_class=DeviceUpdateSerializer
    permission_classes= [permissions.IsAuthenticated]

