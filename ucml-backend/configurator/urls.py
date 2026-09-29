from django.urls import path

from .views import DeviceListCreateView, GenerateConfigView , ConfigJobDetailView, DeviceDetailView,LatestConfigView

urlpatterns=[
    path("devices/",DeviceListCreateView.as_view(),name='device-list-create'),
    path("devices/<int:pk>/",DeviceDetailView.as_view(),name="device-detail"),
    path("devices/<int:device_id>/generate-config/",GenerateConfigView.as_view(),name="generate-config"),
    path("config-jobs/<int:pk>/",ConfigJobDetailView.as_view(),name="config-job-detail"), #check a job's status, and see the generated config once it's ready
    path("devices/<int:device_id>/latest-config/", LatestConfigView.as_view(), name="latest-config"),
]


''' 

curl -X POST http://127.0.0.1:8000/api/devices/ -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_ACCESS_TOKEN" -d "{\"device_name\": \"edge-router-1\", \"device_type\": \"router\", \"vendor\": \"CISCO\", \"model\": \"NCS 5508\", \"topology\": \"B4E\", \"port_no\": \"0/0/0/0\", \"ip_address\": \"10.1.1.1\", \"subnet_mask\": 30, \"gateway\": \"10.1.1.2\", \"mac_address\": \"00:AA:BB:CC:DD:EE\", \"local_as\": 65010, \"system_ip\": \"10.255.1.1\", \"customer_vrf_id\": \"100\", \"customer_vrf_name\": \"CUST-ACME\"}"



curl -X POST http://127.0.0.1:8000/api/devices/1/generate-config/ -H "Authorization: Bearer 
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzg4MDgxNDQwLCJpYXQiOjE3ODgwNzk2NDAsImp0aSI6ImMxYjI3NWU0M2NlNjQ5YzNiOGRkZTQzMjU2MTJhMzMzIiwidXNlcl9pZCI6IjEifQ.OcZCuYijQurIt2GKbb0LPJWwHnH-JVtI2BufS6sGrRw"


{"id":2,"device":1,"status":"PENDING","generated_config":"","error_message":"","created_at":"2026-08-30T08:50:48.375699Z","updated_at":"2026-08-30T08:50:48.375713Z"}
202-style response with a new job created and handed off to Celery instantly. The API didn't wait around for the render.


curl http://127.0.0.1:8000/api/config-jobs/2/ -H "Authorization: Bearer 
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzg4MDgxNDQwLCJpYXQiOjE3ODgwNzk2NDAsImp0aSI6ImMxYjI3NWU0M2NlNjQ5YzNiOGRkZTQzMjU2MTJhMzMzIiwidXNlcl9pZCI6IjEifQ.OcZCuYijQurIt2GKbb0LPJWwHnH-JVtI2BufS6sGrRw"

That should now show "status": "SUCCESS" and generated_config filled in with the
'''

